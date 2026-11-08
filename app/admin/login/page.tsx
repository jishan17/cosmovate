
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        setError("Invalid email or password. Please try again.");
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061326] px-5 py-12 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1b32]/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-9 text-center">
          <img
            src="/cosmovate-logo.png"
            alt="COSMOVATE"
            className="mx-auto mb-5 h-16 w-16 object-contain"
          />

          <p className="mb-3 text-xs font-semibold tracking-[0.35em] text-blue-300">
            COSMOVATE
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Admin Portal
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Sign in to access your team dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-slate-300"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-slate-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/10 bg-[#061326] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in to dashboard"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          COSMOVATE · Authorised team access only
        </p>
      </section>
    </main>
  );
}
