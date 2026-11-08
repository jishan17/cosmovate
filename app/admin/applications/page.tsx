
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import ApplicationManager from "./ApplicationManager";


export default async function ApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const allowedRoles = ["super_admin", "admin", "reviewer"];

  if (!member || !allowedRoles.includes(member.role)) {
    redirect("/admin");
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, full_name, phone, email, department, linkedin_url, status, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#061326] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="text-sm text-blue-300 transition hover:text-white"
        >
          ← Back to Dashboard
        </Link>

        <header className="mb-8 mt-8">
          <p className="text-xs font-semibold tracking-[0.25em] text-blue-300">
            COSMOVATE ADMINISTRATION
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Application Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Review applicants, manage recruitment and collaborate with your team.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
            Unable to load applications. Check your database permissions.
          </div>
        ) : (
          <ApplicationManager
            initialApplications={data ?? []}
            role={member.role}
          />
        )}
      </div>
    </main>
  );
}
