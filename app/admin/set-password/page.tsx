
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/admin/login?error=invitation_session_missing");
        return;
      }

      setAuthenticated(true);
      setChecking(false);
    }

    checkSession();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 10) {
      setError("Your password must contain at least 10 characters.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Use at least one uppercase letter, one lowercase letter and one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#061326] text-white">
        <p className="text-sm text-slate-400">Verifying invitation...</p>
      </main>
    );
  }

  if (!authenticated) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#061326] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1b32] p-8 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <img
            src="/cosmovate-logo.png"
            alt="COSMOVATE"
            className="mx-auto mb-5 h-16 w-16 object-contain"
          />
          <p className="text-xs font-semibold tracking-[0.35em] text-blue-300">
            COSMOVATE
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Set your password</h1>
          <p className="mt-3 text-sm text-slate-400">
            Create a secure password for your team account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-300">
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password"
              className="w-full rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm text-slate-300">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
              className="w-full rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
            />
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Use at least 10 characters, including uppercase and lowercase letters and a number.
          </p>

          {error && (
            <p role="alert" className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Saving password..." : "Set password"}
          </button>
        </form>
      </section>
    </main>
  );
}
