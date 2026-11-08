
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type AuthFormProps = {
  mode: "signup" | "login";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/challenges`,
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/challenges");
          router.refresh();
          return;
        }

        setMessage(
          "Account created! Check your email and click the verification link to activate your COSMOVATE account."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/challenges");
        router.refresh();
        return;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061326] px-5 py-12 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-10 flex items-center justify-center gap-3"
        >
          <img
            src="/cosmovate-logo.png"
            alt="COSMOVATE"
            className="h-11 w-11 object-contain"
          />
          <span className="text-xl font-bold tracking-[0.25em]">
            COSMOVATE
          </span>
        </Link>

        <section className="rounded-3xl border border-blue-300/15 bg-[#0a1b33]/90 p-7 shadow-2xl shadow-blue-950/40 backdrop-blur-xl sm:p-9">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
            Cosmic Challenges
          </p>

          <h1 className="text-center text-3xl font-bold tracking-tight">
            {isSignup ? "Join the explorers." : "Welcome back."}
          </h1>

          <p className="mt-3 text-center text-sm leading-6 text-slate-400">
            {isSignup
              ? "Create your player account and begin your cosmic journey."
              : "Sign in to continue your journey through the universe."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isSignup && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm text-slate-300"
                >
                  Display name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your cosmic identity"
                  required
                  maxLength={40}
                  className="w-full rounded-xl border border-blue-200/15 bg-[#061326] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
                />
              </div>
            )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-blue-200/15 bg-[#061326] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? "At least 8 characters" : "Your password"}
                required
                minLength={isSignup ? 8 : undefined}
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="w-full rounded-xl border border-blue-200/15 bg-[#061326] px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm leading-6 text-emerald-300"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create Player Account"
                  : "Sign In"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            {isSignup ? "Already exploring with us?" : "New to COSMOVATE?"}{" "}
            <Link
              href={isSignup ? "/auth/login" : "/auth/signup"}
              className="font-semibold text-blue-300 hover:text-white"
            >
              {isSignup ? "Sign in" : "Create account"}
            </Link>
          </p>
        </section>

        <Link
          href="/"
          className="mt-7 block text-center text-xs text-slate-500 transition hover:text-blue-300"
        >
          ← Return to COSMOVATE
        </Link>
      </div>
    </main>
  );
}
