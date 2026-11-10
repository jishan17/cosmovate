
"use server";

import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

const allowedRoles = [
  "media_manager",
  "events_manager",
  "content_manager",
] as const;

type InviteResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function inviteTeamMember(
  email: string,
  role: string
): Promise<InviteResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please sign in first." };
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
      return {
        success: false,
        error: "Only an active Super Admin can invite members.",
      };
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: "Enter a valid email address." };
    }

    if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      return { success: false, error: "Invalid team role." };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      return { success: false, error: "The site URL is not configured." };
    }

    const admin = createAdminClient();

    const { data, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(cleanEmail, {
        redirectTo: `${siteUrl}/auth/callback?next=/admin/set-password`,
      });

    if (inviteError) {
      console.error("Supabase invitation error:", inviteError);

      return {
        success: false,
        error: `Invitation failed: ${inviteError.message}`,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Supabase did not return an invited user.",
      };
    }

    // Never overwrite an existing team member's role.
    const { data: existingMember, error: lookupError } = await admin
      .from("team_members")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (lookupError) {
      console.error("Team member lookup error:", lookupError);

      return {
        success: false,
        error: `Account lookup failed: ${lookupError.message}`,
      };
    }

    if (existingMember) {
      return {
        success: false,
        error: `This account already has the role: ${existingMember.role}.`,
      };
    }

    const { error: insertError } = await admin
      .from("team_members")
      .insert({
        user_id: data.user.id,
        role,
        is_active: true,
      });

    if (insertError) {
      console.error("Team role assignment failed:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });

      // Keep the Auth account intact for safe diagnosis.
      return {
        success: false,
        error: `Role assignment failed: ${insertError.message}`,
      };
    }

    return {
      success: true,
      message: `Invitation sent to ${cleanEmail}.`,
    };
  } catch (error) {
    console.error("Team invitation error:", error);

    return {
      success: false,
      error: "An unexpected server error occurred.",
    };
  }
}
