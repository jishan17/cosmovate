
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-red-400/40 hover:text-red-300"
    >
      Sign out
    </button>
  );
}
