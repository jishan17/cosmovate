
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { inviteTeamMember } from "./actions";

type ManagerRole =
  | "media_manager"
  | "events_manager"
  | "content_manager";

type TeamMember = {
  user_id: string;
  role: string;
  roleName: string;
  is_active: boolean;
  created_at: string;
};

export default function TeamManager({
  members,
  loadError,
}: {
  members: TeamMember[];
  loadError: string | null;
}) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ManagerRole>("content_manager");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await inviteTeamMember(email, role);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage(result.message);
      setEmail("");
      router.refresh();
    } catch {
      setError("Something went wrong while sending the invitation.");
    } finally {
      setLoading(false);
    }
  }

  const roleCounts = {
    super_admin: members.filter((m) => m.role === "super_admin").length,
    media_manager: members.filter((m) => m.role === "media_manager").length,
    events_manager: members.filter((m) => m.role === "events_manager").length,
    content_manager: members.filter((m) => m.role === "content_manager").length,
  };

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Super Admins", value: roleCounts.super_admin },
          { label: "Media Managers", value: roleCounts.media_manager },
          { label: "Events Managers", value: roleCounts.events_manager },
          { label: "Content Managers", value: roleCounts.content_manager },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-[#0b1b32] p-5"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0b1b32] p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-blue-300">
            TEAM ACCESS
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Invite a team member
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Send an invitation email and assign a management role.
          </p>
        </div>

        <form onSubmit={handleInvite} className="space-y-5">
          <div>
            <label
              htmlFor="invite-email"
              className="mb-2 block text-sm text-slate-300"
            >
              Email address
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="manager@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
            />
          </div>

          <div>
            <label
              htmlFor="invite-role"
              className="mb-2 block text-sm text-slate-300"
            >
              Assign role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as ManagerRole)
              }
              className="w-full rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-white outline-none focus:border-blue-400"
            >
              <option value="media_manager">Media Manager</option>
              <option value="events_manager">Events Manager</option>
              <option value="content_manager">Content Manager</option>
            </select>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Sending invitation..." : "Send invitation →"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1b32]">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-semibold">Team members</h2>
          <p className="mt-1 text-sm text-slate-400">
            All registered COSMOVATE team accounts.
          </p>
        </div>

        {loadError ? (
          <p className="p-6 text-sm text-red-300">
            Unable to load team members: {loadError}
          </p>
        ) : members.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">
            No team members found.
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-all text-sm font-medium text-white">
                    {member.user_id}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Joined{" "}
                    {new Date(member.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300">
                    {member.roleName}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs ${
                      member.is_active
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-500">
        Account identifiers are displayed because email addresses are not
        currently stored in the team_members table. Account deactivation and
        role changes will be added with server-side safeguards.
      </p>
    </div>
  );
}
