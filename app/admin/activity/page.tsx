
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import LogoutButton from "../components/logout-button";

export const instant = false;

type AuditLog = {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

function formatAction(action: string) {
  return action
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" · ");
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ActivityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: member } = await supabase
    .from("team_members")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    !member ||
    member.role !== "super_admin" ||
    !member.is_active
  ) {
    redirect("/admin");
  }

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_user_id, action, entity_type, entity_id, details, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const auditLogs = (logs ?? []) as AuditLog[];

  // Resolve actor IDs to email addresses using the server-only admin client.
  const actorIds = [
    ...new Set(
      auditLogs
        .map((log) => log.actor_user_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const admin = createAdminClient();

  const actorEntries = await Promise.all(
    actorIds.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      return [id, data.user?.email ?? "Unknown account"] as const;
    })
  );

  const actorEmails = new Map(actorEntries);

  return (
    <main className="min-h-screen bg-[#061326] text-white">
      <header className="border-b border-white/10 bg-[#0b1b32]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <img
              src="/cosmovate-logo.png"
              alt="COSMOVATE"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-blue-300">
                COSMOVATE
              </p>
              <p className="text-xs text-slate-400">Activity Log</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <Link
          href="/admin"
          className="text-sm text-blue-300 hover:text-blue-200"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-7">
          <p className="text-sm font-medium tracking-[0.2em] text-blue-300">
            SUPER ADMIN
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Activity Log
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor actions performed across the COSMOVATE management system.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b1b32] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-400">
                Showing the latest {auditLogs.length} recorded events.
              </p>
            </div>
            <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs text-blue-200">
              Super Admin only
            </span>
          </div>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
              Could not load activity logs: {error.message}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-12 text-center">
              <p className="text-lg font-medium text-slate-200">
                No activity recorded yet
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Actions will appear here once audit logging is triggered.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {auditLogs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-semibold capitalize text-white">
                        {formatAction(log.action)}
                      </h3>

                      <p className="mt-2 break-all text-sm text-slate-400">
                        By:{" "}
                        <span className="text-blue-200">
                          {log.actor_user_id
                            ? actorEmails.get(log.actor_user_id) ??
                              "Unknown account"
                            : "System / unknown actor"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Entity:{" "}
                        <span className="text-slate-200">
                          {log.entity_type}
                        </span>
                        {log.entity_id && (
                          <span className="break-all text-slate-500">
                            {" "}
                            · {log.entity_id}
                          </span>
                        )}
                      </p>
                    </div>

                    <time className="shrink-0 text-xs text-slate-500">
                      {formatDate(log.created_at)}
                    </time>
                  </div>

                  {log.details &&
                    Object.keys(log.details).length > 0 && (
                      <details className="mt-4 border-t border-white/10 pt-3">
                        <summary className="cursor-pointer text-sm text-blue-300 hover:text-blue-200">
                          View change details
                        </summary>
                        <pre className="mt-3 overflow-x-auto rounded-lg bg-black/20 p-3 text-xs leading-6 text-slate-300">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
