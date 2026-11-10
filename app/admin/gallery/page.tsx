
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import GalleryManager from "./gallery-manager";

export const instant = false;

export default async function AdminGalleryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: member, error } = await supabase
    .from("team_members")
    .select("role, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasAccess =
    !error &&
    member &&
    member.is_active === true &&
    ["super_admin", "media_manager"].includes(member.role);

  if (!hasAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#061326] px-5 text-white">
        <section className="max-w-md rounded-2xl border border-red-400/20 bg-[#0b1b32] p-8 text-center">
          <h1 className="text-2xl font-semibold">Access denied</h1>

          <p className="mt-3 text-sm text-slate-400">
            Only active Super Admins and Media Managers can manage Space Gallery images.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-block text-sm text-blue-300 hover:text-white"
          >
            Return to dashboard →
          </Link>
        </section>
      </main>
    );
  }

  return <GalleryManager />;
}
