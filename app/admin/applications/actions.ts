
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

const allowedStatuses = [
  "Pending",
  "Shortlisted",
  "Accepted",
  "Rejected",
] as const;

async function getAuthorisedMember() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must sign in first.");
  }

  const { data: member, error: memberError } = await supabase
    .from("team_members")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    memberError ||
    !member ||
    member.role !== "super_admin" ||
    member.is_active !== true
  ) {
    throw new Error("Only an active Super Admin is authorised.");
  }

  return { supabase, user };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  const { supabase } = await getAuthorisedMember();

  if (!applicationId || !allowedStatuses.includes(
    status as (typeof allowedStatuses)[number]
  )) {
    throw new Error("Invalid application ID or status.");
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Application not found or update not permitted.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/applications");

  return { success: true };
}

export async function getApplicationNotes(applicationId: string) {
  const { supabase } = await getAuthorisedMember();

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  const { data, error } = await supabase
    .from("application_notes")
    .select("id, application_id, author_id, note, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function addApplicationNote(
  applicationId: string,
  note: string
) {
  const { supabase, user } = await getAuthorisedMember();

  const cleanNote = note.trim();

  if (!applicationId) {
    throw new Error("Application ID is required.");
  }

  if (!cleanNote || cleanNote.length > 5000) {
    throw new Error("Notes must contain between 1 and 5000 characters.");
  }

  const { error } = await supabase
    .from("application_notes")
    .insert({
      application_id: applicationId,
      author_id: user.id,
      note: cleanNote,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/applications");

  return { success: true };
}
