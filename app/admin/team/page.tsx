
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import LogoutButton from "../components/logout-button";
import TeamManager from "./TeamManager";

export const instant = false;

export default async function TeamPage() {
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

  const { data: members, error } = await supabase
    .from("team_members")
    .select("user_id, role, is_active, created_at")
    .order("created_at", { ascending: false });

  const roleNames: Record<string, string> = {
    super_admin: "Super Admin",
    media_manager: "Media Manager",
    events_manager: "Events Manager",
    content_manager: "Content Manager",
  };

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
              <p className="text-xs text-slate-400">Team Management</p>
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
            Team Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Invite managers and oversee COSMOVATE team accounts.
          </p>
        </div>

        <div className="mt-8">
          <TeamManager
            members={(members ?? []).map((item) => ({
              ...item,
              roleName: roleNames[item.role] ?? item.role,
            }))}
            loadError={error?.message ?? null}
          />
        </div>
      </div>
    </main>
  );
}
