
import { createClient } from "../../../lib/supabase/server";

function escapeCsv(value: string | null | undefined) {
  let safeValue = value ?? "";

  // Prevent spreadsheet formula injection.
  if (/^[\s]*[=+\-@]/.test(safeValue)) {
    safeValue = `'${safeValue}`;
  }

  return `"${safeValue.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Authentication required.", { status: 401 });
  }

  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (member?.role !== "super_admin") {
    return new Response("You are not authorised to export applications.", {
      status: 403,
    });
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, full_name, phone, email, department, linkedin_url, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return new Response("Unable to export applications.", { status: 500 });
  }

  const headers = [
    "Application ID",
    "Full Name",
    "Phone",
    "Email",
    "Department",
    "LinkedIn",
    "Status",
    "Submitted At",
  ];

  const rows = (data ?? []).map((application) =>
    [
      application.id,
      application.full_name,
      application.phone,
      application.email,
      application.department,
      application.linkedin_url,
      application.status,
      application.created_at,
    ]
      .map(escapeCsv)
      .join(",")
  );

  const csv = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");

  return new Response("\uFEFF" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="cosmovate-applications.csv"',
      "Cache-Control": "no-store",
    },
  });
}
