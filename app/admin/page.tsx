
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import LogoutButton from "./components/logout-button";
import { connection } from "next/server";

export const instant = false;

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

const roleNames: Record<string, string> = {
  super_admin: "Super Admin",
  media_manager: "Media Manager",
  events_manager: "Events Manager",
  content_manager: "Content Manager",
};

const roleDescriptions: Record<string, string> = {
  super_admin: "Full administrative control over COSMOVATE.",
  media_manager: "Manage COSMOVATE media and visual assets.",
  events_manager: "Manage events, schedules and announcements.",
  content_manager: "Manage website content and publications.",
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

function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#061326] px-5 text-white">
      <section className="max-w-md rounded-2xl border border-red-400/20 bg-[#0b1b32] p-8 text-center">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-slate-400">
          Your account is inactive or is not authorised to access the
          COSMOVATE Admin Portal.
        </p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}

export default async function AdminDashboard() {
  await connection();
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: member, error: roleError } = await supabase
    .from("team_members")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  const validRoles = [
    "super_admin",
    "media_manager",
    "events_manager",
    "content_manager",
  ];

  if (
    roleError ||
    !member ||
    member.is_active !== true ||
    !validRoles.includes(member.role)
  ) {
    return <AccessDenied />;
  }

  const isSuperAdmin = member.role === "super_admin";
  const isMediaManager = member.role === "media_manager";

  let applications: Application[] = [];
  let applicationError: string | null = null;

  if (isSuperAdmin) {
    const { data, error } = await supabase
      .from("applications")
      .select(
        "id, full_name, phone, email, department, linkedin_url, status, created_at"
      )
      .order("created_at", { ascending: false });

    applications = (data ?? []) as Application[];
    applicationError = error?.message ?? null;
  }

  const total = applications.length;
  const pending = applications.filter(
    (application) => application.status === "Pending"
  ).length;
  const shortlisted = applications.filter(
    (application) => application.status === "Shortlisted"
  ).length;
  const accepted = applications.filter(
    (application) => application.status === "Accepted"
  ).length;
  const rejected = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

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
            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
              {roleNames[member.role]}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium tracking-[0.2em] text-blue-300">
            CONTROL CENTRE
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {isSuperAdmin
              ? "Dashboard Overview"
              : `${roleNames[member.role]} Dashboard`}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {roleDescriptions[member.role]}
          </p>
        </div>

        {isSuperAdmin ? (
          <>
            <div className="mb-8 flex flex-wrap gap-3">
              <Link
                href="/admin/applications"
                className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20"
              >
                Manage applications →
              </Link>

              <Link
                href="/admin/team"
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
              >
                Manage team →
              </Link>

              <Link
                href="/admin/gallery"
                className="rounded-xl border border-pink-400/30 bg-pink-500/10 px-5 py-3 text-sm font-semibold text-pink-200 transition hover:bg-pink-500/20"
              >
                Manage Gallery →
              </Link>

              <Link
                href="/admin/activity"
                className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
              >
                View activity log →
              </Link>

              <Link
                href="/admin/export"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
              >
                ↓ Export CSV
              </Link>
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
                  <h2 className="text-xl font-semibold">
                    Recent applications
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Latest membership submissions
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
                  {total} applications
                </span>
              </div>

              {applicationError ? (
                <p className="p-6 text-sm text-red-300">
                  Unable to load applications. Check your database permissions.
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
                            <p className="font-medium">
                              {application.full_name}
                            </p>
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
                            {new Date(
                              application.created_at
                            ).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusStyle(
                                application.status
                              )}`}
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
          </>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-[#0b1b32] p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-300">
              YOUR WORKSPACE
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Welcome to your management workspace
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Your account is active. Your role-specific management tools are
              available below. Recruitment applications and applicant
              information are restricted to the Super Admin.
            </p>

            <div className="mt-6 rounded-xl border border-blue-400/20 bg-blue-500/5 p-4 text-sm text-blue-200">
              Assigned role: {roleNames[member.role]}
            </div>

            {isMediaManager && (
              <div className="mt-6 rounded-xl border border-pink-400/20 bg-pink-500/5 p-5">
                <h3 className="text-lg font-semibold text-pink-200">
                  Media Management
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Upload, organise, update and manage COSMOVATE gallery
                  albums and photographs.
                </p>
                <Link
                  href="/admin/gallery"
                  className="mt-5 inline-flex rounded-xl border border-pink-400/30 bg-pink-500/10 px-5 py-3 text-sm font-semibold text-pink-200 transition hover:bg-pink-500/20"
                >
                  Open Gallery Manager →
                </Link>
              </div>
            )}
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
