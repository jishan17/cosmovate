
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

function InvitationHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying your invitation...");

  useEffect(() => {
    let cancelled = false;

    async function completeInvitation() {
      const requestedNext = searchParams.get("next");

      const next =
        requestedNext?.startsWith("/") &&
        !requestedNext.startsWith("//") &&
        !requestedNext.includes("\\")
          ? requestedNext
          : "/admin/set-password";

      const hash = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );

      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const tokenType = hash.get("type");

      if (!accessToken || !refreshToken) {
        setMessage("Invitation link is invalid or has expired.");
        return;
      }

      if (tokenType !== "invite") {
        setMessage("This link is not a valid team invitation.");
        return;
      }

      const supabase = createClient();

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("Invitation session error:", error.message);

        if (!cancelled) {
          setMessage(
            "Unable to verify invitation. Please request a new invitation."
          );
        }
        return;
      }

      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );

      if (!cancelled) {
        setMessage("Invitation verified. Redirecting to password setup...");
        router.replace(next);
        router.refresh();
      }
    }

    completeInvitation();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#061326] px-5 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1b32] p-8 text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400" />

        <h1 className="text-xl font-semibold">
          COSMOVATE Invitation
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {message}
        </p>

        <p className="mt-6 text-xs tracking-widest text-blue-300">
          EXPLORE. INNOVATE. DISCOVER.
        </p>
      </section>
    </main>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#061326] px-5 text-white">
          <p className="text-sm text-slate-400">
            Preparing invitation verification...
          </p>
        </main>
      }
    >
      <InvitationHandler />
    </Suspense>
  );
}
