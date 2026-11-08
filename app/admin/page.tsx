
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import LogoutButton from "./components/logout-button";

type Application = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  department: string;
  linkedin_url: string | null;
  status: string;
  created_at: string;
};

function statusStyle(status: string) {
  switch (status) {
    case "Accepted":
      return "bg-emerald-500/10 text-emerald-300";
    case "Shortlisted":
      return "bg-blue-500/10 text-blue-300";
    case "Rejected":
      return "bg-red-500/10 text-red-300";
    default:
      return "bg-amber-500/10 text-amber-300";
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: member, error: roleError } = await supabase
    .from("team_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError || !member) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#061326] px-5 text-white">
        <section className="max-w-md rounded-2xl border border-red-400/20 bg-[#0b1b32] p-8 text-center">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="mt-3 text-sm text-slate-400">
            Your account is not authorised to access the COSMOVATE Admin Portal.
          </p>
          <div className="mt-6">
            <LogoutButton />
          </div>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, full_name, phone, email, department, linkedin_url, status, created_at"
    )
    .order("created_at", { ascending: false });

  const applications = (data ?? []) as Application[];

  const total = applications.length;
  const pending = applications.filter((a) => a.status === "Pending").length;
  const shortlisted = applications.filter(
    (a) => a.status === "Shortlisted"
  ).length;
  const accepted = applications.filter((a) => a.status === "Accepted").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;

  const roleNames: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    reviewer: "Reviewer",
  };

  const stats = [
    { label: "Total applications", value: total },
    { label: "Pending", value: pending },
    { label: "Shortlisted", value: shortlisted },
    { label: "Accepted", value: accepted },
    { label: "Rejected", value: rejected },
  ];

  return (
    <main className="min-h-screen bg-[#061326] text-white">
      <header className="border-b border-white/10 bg-[#0b1b32]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <img
              src="/cosmovate-logo.png"
              alt="COSMOVATE"
              className="h-11 w-11 object-contain"
            />
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-blue-300">
                COSMOVATE
              </p>
              <p className="text-xs text-slate-400">Administration</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <span className="hidden rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300 sm:inline">
              {roleNames[member.role] ?? member.role}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-medium tracking-[0.2em] text-blue-300">
              CONTROL CENTRE
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage COSMOVATE membership applications and recruitment.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/applications"
              className="inline-flex items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:border-blue-300 hover:bg-blue-500/20"
            >
              Manage applications →
            </Link>

            {member.role === "super_admin" && (
              <a
                href="/admin/export"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-300/40 hover:bg-white/[0.08]"
              >
                ↓ Export CSV
              </a>
            )}
          </div>
        </div>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#0b1b32] p-5"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1b32]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
            <div>
              <h2 className="text-xl font-semibold">Recent applications</h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest membership submissions
              </p>
            </div>
            <span className="rounded-full bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
              {total} applications
            </span>
          </div>

          {error ? (
            <p className="p-6 text-sm text-red-300">
              Unable to load applications. Please check your database permissions.
            </p>
          ) : applications.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-400">
              No applications have been submitted yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Applicant</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">{application.full_name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {application.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {application.department}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {application.phone}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        {new Date(application.created_at).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusStyle(application.status)}`}
                        >
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {member.role === "super_admin" && (
          <section className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-500/5 p-5">
            <h2 className="font-semibold">Super Admin access</h2>
            <p className="mt-2 text-sm text-slate-400">
              Your account has full administrative privileges, including
              application export and team management.
            </p>
          </section>
        )}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>COSMOVATE · Secure Administration</span>
          <Link href="/" className="transition hover:text-blue-300">
            Visit public website →
          </Link>
        </footer>
      </div>
    </main>
  );
}
