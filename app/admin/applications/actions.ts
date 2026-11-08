
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

const allowedRoles = ["super_admin", "admin", "reviewer"];
const editableRoles = ["super_admin", "admin"];
const allowedStatuses = ["Pending", "Shortlisted", "Accepted", "Rejected"];

async function getAuthorisedMember() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must sign in first.");
  }

  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member || !allowedRoles.includes(member.role)) {
    throw new Error("You are not authorised.");
  }

  return { supabase, user, role: member.role };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
) {
  const { supabase, role } = await getAuthorisedMember();

  if (!editableRoles.includes(role)) {
    throw new Error("You do not have permission to update statuses.");
  }

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid application status.");
  }

  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/applications");

  return { success: true };
}

export async function getApplicationNotes(applicationId: string) {
  const { supabase } = await getAuthorisedMember();

  const { data, error } = await supabase
    .from("application_notes")
    .select("id, application_id, author_id, note, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function addApplicationNote(
  applicationId: string,
  note: string
) {
  const { supabase, user } = await getAuthorisedMember();

  const cleanNote = note.trim();

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

  if (error) throw new Error(error.message);

  revalidatePath("/admin/applications");

  return { success: true };
}
