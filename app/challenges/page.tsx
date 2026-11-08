
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GuestProfile = {
  id: string;
  displayName: string;
  totalXP: number;
};

const STORAGE_KEY = "cosmovate_guest_explorer";

const challenges = [
  {
    id: "astronomy",
    icon: "🔭",
    title: "Astronomy",
    description: "Explore stars, galaxies, constellations and the night sky.",
    difficulty: "BEGINNER",
    questions: "10 QUESTIONS",
    color: "from-blue-500/20 to-cyan-500/5",
    available: true,
  },
  {
    id: "astrophysics",
    icon: "🪐",
    title: "Astrophysics",
    description: "Challenge your understanding of the physics of our universe.",
    difficulty: "INTERMEDIATE",
    questions: "10 QUESTIONS",
    color: "from-violet-500/20 to-blue-500/5",
    available: true,
  },
  {
    id: "space-exploration",
    icon: "🚀",
    title: "Space Exploration",
    description: "Test your knowledge of missions, spacecraft and discoveries.",
    difficulty: "INTERMEDIATE",
    questions: "10 QUESTIONS",
    color: "from-cyan-500/20 to-indigo-500/5",
    available: true,
  },
  {
    id: "cosmic-research",
    icon: "🌌",
    title: "Cosmic Research",
    description: "Take on questions about exoplanets, black holes and more.",
    difficulty: "ADVANCED",
    questions: "10 QUESTIONS",
    color: "from-fuchsia-500/20 to-purple-500/5",
    available: true,
  },
];

export default function CosmicChallengesPage() {
  const [profile, setProfile] = useState<GuestProfile | null>(null);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY);

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as GuestProfile;

        if (parsed.id && parsed.displayName) {
          setProfile(parsed);
          return;
        }
      }

      const explorerNumber = Math.floor(1000 + Math.random() * 9000);

      const newProfile: GuestProfile = {
        id: `guest-${Date.now()}`,
        displayName: `Explorer-${explorerNumber}`,
        totalXP: 0,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error("Could not load guest profile:", error);
      setProfile({
        id: "temporary-guest",
        displayName: "Cosmic Explorer",
        totalXP: 0,
      });
    }
  }, []);

  const xp = profile?.totalXP ?? 0;
  const level = Math.floor(xp / 500) + 1;
  const currentLevelXP = xp % 500;
  const progress = (currentLevelXP / 500) * 100;

  return (
    <main className="min-h-screen overflow-hidden bg-[#050d1b] text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(#8bbaff 0.7px, transparent 0.7px)",
            backgroundSize: "34px 34px",
          }}
        />
      </div>

      {/* Navigation */}
      <header className="relative z-10 border-b border-white/[0.08] bg-[#071326]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/cosmovate-logo.png"
              alt="COSMOVATE"
              className="h-10 w-10 object-contain"
            />

            <div>
              <p className="text-sm font-bold tracking-[0.24em]">
                COSMOVATE
              </p>
              <p className="text-[9px] tracking-[0.28em] text-blue-300">
                COSMIC CHALLENGES
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2 text-[10px] font-bold tracking-wider text-emerald-200">
              GUEST MODE
            </span>

            <Link
              href="/"
              className="hidden text-sm text-slate-400 transition hover:text-white sm:block"
            >
              Main Website
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-[1] mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-300/15 bg-gradient-to-br from-[#10294a] via-[#0b1b32] to-[#11112c] p-7 shadow-2xl shadow-blue-950/20 sm:p-11">
          <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-blue-200/10 sm:right-8 sm:top-[-100px]">
            <div className="absolute inset-5 rounded-full border border-blue-200/10" />
            <div className="absolute inset-12 rounded-full border border-blue-200/10" />
            <div className="absolute inset-0 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="absolute right-10 top-12 h-3 w-3 rounded-full bg-cyan-200 shadow-[0_0_25px_8px_rgba(103,232,249,0.4)]" />
          </div>

          <div className="relative max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-cyan-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              MISSION STATUS: ACTIVE
            </div>

            <p className="text-xs font-semibold tracking-[0.32em] text-blue-300">
              THE COSMIC KNOWLEDGE ARENA
            </p>

            <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">
              YOUR UNIVERSE.
              <br />
              <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                YOUR CHALLENGE.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Explore the mysteries of space, test your scientific knowledge
              and rise through the ranks. No account needed. Just curiosity.
            </p>

            <a
              href="#quiz-arena"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-900/40 transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              Explore Challenges <span>→</span>
            </a>
          </div>

          <div className="relative mt-10 flex flex-wrap gap-6 border-t border-white/10 pt-6 sm:mt-12">
            <div>
              <p className="text-2xl font-black">04</p>
              <p className="mt-1 text-[10px] tracking-[0.18em] text-slate-400">
                KNOWLEDGE DOMAINS
              </p>
            </div>

            <div>
              <p className="text-2xl font-black">10</p>
              <p className="mt-1 text-[10px] tracking-[0.18em] text-slate-400">
                QUESTIONS PER QUIZ
              </p>
            </div>

            <div>
              <p className="text-2xl font-black">∞</p>
              <p className="mt-1 text-[10px] tracking-[0.18em] text-slate-400">
                POSSIBILITIES
              </p>
            </div>
          </div>
        </section>

        {/* Guest explorer profile */}
        <section className="mt-8">
          <div className="rounded-2xl border border-white/[0.09] bg-[#0a1729]/90 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.24em] text-blue-300">
                  EXPLORER PROFILE
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {profile
                    ? `Welcome, ${profile.displayName}`
                    : "Preparing your explorer profile..."}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Your guest profile is saved on this browser.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-300/20 bg-blue-400/10 text-2xl">
                👨‍🚀
              </div>
            </div>

            <div className="mt-7 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">CURRENT RANK</p>
                <p className="mt-1 text-2xl font-black text-cyan-200">
                  Level {level}
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-300">
                {xp.toLocaleString("en-IN")} XP
              </p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {currentLevelXP} / 500 XP to Level {level + 1}
            </p>

            <div className="mt-5 rounded-xl border border-blue-300/15 bg-blue-400/[0.06] p-4">
              <p className="text-xs leading-6 text-slate-300">
                No registration, passwords or email verification required.
                Your guest progress stays on this browser and is not synced
                across devices.
              </p>
            </div>
          </div>
        </section>

        {/* Quiz Arena */}
        <section id="quiz-arena" className="scroll-mt-8 pt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.28em] text-cyan-300">
                SELECT YOUR MISSION
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight">
                The Quiz Arena
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Choose a knowledge domain and prepare for launch.
              </p>
            </div>

            <span className="rounded-full border border-blue-300/20 bg-blue-400/[0.06] px-3 py-1.5 text-[10px] font-bold tracking-wider text-blue-200">
              04 DOMAINS
            </span>
          </div>

          
<div className="mt-7 grid gap-5 sm:grid-cols-2">
  {challenges.map((challenge, index) => (
    <a
      key={challenge.id}
      href={`/challenges/${challenge.id}`}
      className="block h-full cursor-pointer no-underline"
      aria-label={`Play ${challenge.title} quiz`}
    >
      <article
        className={`group relative h-full overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br ${challenge.color} p-6 transition duration-300 ${
          challenge.available
            ? "hover:-translate-y-1 hover:border-blue-300/30"
            : "opacity-75"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#071326]/70 text-3xl">
            {challenge.icon}
          </div>

          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[9px] font-bold tracking-wider text-slate-300">
            MISSION 0{index + 1}
          </span>
        </div>

        <h3 className="mt-6 text-xl font-bold">{challenge.title}</h3>

        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
          {challenge.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-md border border-blue-300/15 bg-blue-300/[0.06] px-2.5 py-1.5 text-[9px] font-bold tracking-wider text-blue-200">
            {challenge.difficulty}
          </span>

          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[9px] font-bold tracking-wider text-slate-300">
            {challenge.questions}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs font-semibold text-cyan-200">
            {challenge.available ? "Play as Guest" : "Mission preparing"}
          </span>

          <span className="text-lg text-blue-200 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </article>
    </a>
  ))}
</div>

        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/[0.08] py-7 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-slate-300">
            COSMOVATE
          </p>

          <p className="mt-2 text-[10px] tracking-wider text-slate-500">
            EXPLORE. INNOVATE. DISCOVER.
          </p>

          <Link
            href="/"
            className="mt-4 inline-block text-xs text-blue-300 transition hover:text-white"
          >
            ← Back to main website
          </Link>
        </footer>
      </div>
    </main>
  );
}
