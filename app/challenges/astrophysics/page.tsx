
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cosmovate_guest_explorer";
const QUESTION_TIME = 20;

const questions = [
  {
    question: "What is the primary source of energy produced by the Sun?",
    options: [
      "Chemical combustion",
      "Nuclear fusion",
      "Nuclear fission",
      "Gravitational friction",
    ],
    answer: 1,
    explanation:
      "The Sun produces energy by fusing hydrogen nuclei into helium in its core, releasing enormous amounts of energy.",
  },
  {
    question: "What is the boundary around a black hole beyond which nothing can escape called?",
    options: [
      "Singularity",
      "Accretion disk",
      "Event horizon",
      "Photon cloud",
    ],
    answer: 2,
    explanation:
      "The event horizon is the boundary beyond which escape would require travelling faster than light.",
  },
  {
    question: "What does a light-year measure?",
    options: ["Time", "Brightness", "Distance", "Mass"],
    answer: 2,
    explanation:
      "A light-year is the distance light travels in one year, approximately 9.46 trillion kilometres.",
  },
  {
    question: "Which force keeps planets in orbit around the Sun?",
    options: ["Magnetism", "Gravity", "Strong nuclear force", "Friction"],
    answer: 1,
    explanation:
      "The Sun's gravitational attraction keeps planets moving in their orbits around it.",
  },
  {
    question: "What is the extremely dense remnant of a massive star after a supernova called?",
    options: ["White dwarf", "Red giant", "Neutron star", "Brown dwarf"],
    answer: 2,
    explanation:
      "A neutron star is an incredibly dense stellar remnant formed when the core of a massive star collapses.",
  },
  {
    question: "Which phenomenon causes light from distant galaxies to shift towards longer wavelengths as space expands?",
    options: [
      "Blue shift",
      "Gravitational lensing",
      "Cosmic redshift",
      "Solar wind",
    ],
    answer: 2,
    explanation:
      "Cosmic redshift occurs because the expansion of space stretches the wavelength of light travelling through it.",
  },
  {
    question: "What is the Chandrasekhar limit approximately associated with?",
    options: [
      "Maximum mass of a stable white dwarf",
      "Minimum mass of a neutron star",
      "Size of the Milky Way",
      "Temperature of the Sun",
    ],
    answer: 0,
    explanation:
      "The Chandrasekhar limit is approximately 1.4 solar masses, the maximum mass for a stable white dwarf supported by electron degeneracy pressure.",
  },
  {
    question: "What is an accretion disk?",
    options: [
      "A ring of dark matter",
      "A rotating disk of material falling towards a massive object",
      "A type of galaxy",
      "A region without gravity",
    ],
    answer: 1,
    explanation:
      "An accretion disk forms when gas and dust orbit and gradually fall towards a massive object such as a black hole or young star.",
  },
  {
    question: "What is the cosmic microwave background radiation?",
    options: [
      "Radiation from the Sun",
      "The afterglow of the early universe",
      "Radiation from black holes only",
      "Radio signals from distant planets",
    ],
    answer: 1,
    explanation:
      "The cosmic microwave background is ancient radiation released when the universe became transparent, roughly 380,000 years after the Big Bang.",
  },
  {
    question: "According to general relativity, what does a massive object do to spacetime?",
    options: [
      "Destroys spacetime",
      "Creates new dimensions",
      "Curves spacetime",
      "Stops time everywhere",
    ],
    answer: 2,
    explanation:
      "Einstein's general relativity describes gravity as the curvature of spacetime caused by mass and energy.",
  },
];

type GuestProfile = {
  id: string;
  displayName: string;
  totalXP: number;
};

export default function AstrophysicsQuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [finished, setFinished] = useState(false);
  const [savedTotalXP, setSavedTotalXP] = useState<number | null>(null);
  const [saveError, setSaveError] = useState(false);

  const xpSavedRef = useRef(false);

  const question = questions[current];

  function recordAnswer(choice: number | null) {
    if (selected !== null || finished) return;

    setSelected(choice);

    if (choice === question.answer) {
      setScore((previous) => previous + 1);
    }
  }

  useEffect(() => {
    if (finished || selected !== null) return;

    if (timeLeft <= 0) {
      recordAnswer(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [timeLeft, selected, finished]);

  useEffect(() => {
    if (!finished || xpSavedRef.current) return;

    xpSavedRef.current = true;

    const xpEarned = score * 10;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      let profile: GuestProfile;

      if (saved) {
        const parsed = JSON.parse(saved) as GuestProfile;

        profile = {
          id: parsed.id || `guest-${Date.now()}`,
          displayName: parsed.displayName || "Cosmic Explorer",
          totalXP: Math.max(0, Number(parsed.totalXP) || 0),
        };
      } else {
        profile = {
          id: `guest-${Date.now()}`,
          displayName: "Cosmic Explorer",
          totalXP: 0,
        };
      }

      profile.totalXP += xpEarned;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setSavedTotalXP(profile.totalXP);
    } catch (error) {
      console.error("Could not save guest XP:", error);
      setSaveError(true);
    }
  }, [finished, score]);

  function nextQuestion() {
    if (selected === null) return;

    if (current === questions.length - 1) {
      setFinished(true);
      return;
    }

    setCurrent((previous) => previous + 1);
    setSelected(null);
    setTimeLeft(QUESTION_TIME);
  }

  function restartQuiz() {
    xpSavedRef.current = false;
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setTimeLeft(QUESTION_TIME);
    setFinished(false);
    setSavedTotalXP(null);
    setSaveError(false);
  }

  const progress = finished
    ? 100
    : ((current + 1) / questions.length) * 100;

  const xpEarned = score * 10;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050d1b] px-5 py-8 text-white sm:py-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/challenges" className="flex items-center gap-2">
            <span className="text-xl">←</span>
            <span className="text-sm font-semibold text-slate-300">
              Challenges
            </span>
          </Link>

          <span className="text-xs font-bold tracking-[0.2em] text-blue-300">
            COSMOVATE
          </span>
        </header>

        <div className="mb-7 text-center">
          <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-violet-200">
            MISSION 02 · ASTROPHYSICS
          </span>

          <h1 className="mt-6 text-3xl font-black sm:text-5xl">
            Astrophysics Quiz
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Explore the physics behind the universe.
          </p>
        </div>

        {!finished ? (
          <section className="rounded-3xl border border-white/10 bg-[#0a1729]/95 p-6 shadow-2xl shadow-blue-950/20 sm:p-9">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold tracking-wider text-slate-400">
                QUESTION {current + 1} OF {questions.length}
              </span>

              <span
                className={`font-bold ${
                  timeLeft <= 5 ? "text-red-400" : "text-cyan-200"
                }`}
              >
                ⏱ {timeLeft}s
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <h2 className="mt-9 text-xl font-bold leading-relaxed sm:text-2xl">
              {question.question}
            </h2>

            <div className="mt-7 space-y-3">
              {question.options.map((option, index) => {
                const isCorrect = index === question.answer;
                const isSelected = selected === index;

                let optionStyle =
                  "border-white/10 bg-white/[0.03] hover:border-blue-300/40 hover:bg-blue-400/[0.06]";

                if (selected !== null && isCorrect) {
                  optionStyle =
                    "border-emerald-400/50 bg-emerald-400/10 text-emerald-200";
                } else if (isSelected && !isCorrect) {
                  optionStyle =
                    "border-red-400/50 bg-red-400/10 text-red-200";
                }

                return (
                  <button
                    key={option}
                    onClick={() => recordAnswer(index)}
                    disabled={selected !== null}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left text-sm transition ${optionStyle} disabled:cursor-default`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-xs font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span className="font-medium">{option}</span>

                    <span className="ml-auto">
                      {selected !== null && isCorrect && "✓"}
                      {isSelected && !isCorrect && "✕"}
                    </span>
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div className="mt-6 rounded-xl border border-blue-300/15 bg-blue-400/[0.06] p-4">
                <p className="text-sm font-bold text-cyan-200">
                  {selected === question.answer
                    ? "Correct answer! +10 XP"
                    : "Not quite! Keep exploring."}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {question.explanation}
                </p>

                <button
                  onClick={nextQuestion}
                  className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold transition hover:bg-blue-500"
                >
                  {current === questions.length - 1
                    ? "Complete Mission"
                    : "Next Question →"}
                </button>
              </div>
            )}

            {selected === null && (
              <p className="mt-6 text-center text-xs text-slate-500">
                Choose your answer before the timer runs out.
              </p>
            )}
          </section>
        ) : (
          <section className="rounded-3xl border border-blue-300/20 bg-[#0a1729]/95 p-7 text-center shadow-2xl shadow-blue-950/20 sm:p-10">
            <div className="text-6xl">🏆</div>

            <p className="mt-6 text-xs font-bold tracking-[0.25em] text-cyan-200">
              MISSION COMPLETED
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              {score >= 8
                ? "Outstanding Physicist!"
                : score >= 5
                  ? "Brilliant Discovery!"
                  : "Keep Exploring!"}
            </h2>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-slate-400">YOUR FINAL SCORE</p>

              <p className="mt-2 text-5xl font-black text-cyan-200">
                {score}/{questions.length}
              </p>

              <p className="mt-3 text-sm text-slate-400">
                {Math.round((score / questions.length) * 100)}% accuracy
              </p>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-xs text-slate-400">EXPERIENCE EARNED</p>

                <p className="mt-2 text-2xl font-black text-amber-300">
                  +{xpEarned} XP
                </p>

                {saveError ? (
                  <p className="mt-3 text-xs text-red-300">
                    Your XP could not be saved. Check your browser storage settings.
                  </p>
                ) : savedTotalXP !== null ? (
                  <p className="mt-3 text-xs text-emerald-300">
                    XP saved! Your total is now {savedTotalXP} XP.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">
                    Saving your explorer progress...
                  </p>
                )}
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                onClick={restartQuiz}
                className="rounded-xl bg-blue-600 px-5 py-3 font-bold transition hover:bg-blue-500"
              >
                Play Again
              </button>

              <Link
                href="/challenges"
                className="rounded-xl border border-blue-300/30 bg-blue-400/10 px-5 py-3 font-bold text-cyan-200 transition hover:bg-blue-400/20"
              >
                Challenge Arena
              </Link>
            </div>

            <Link
              href="/"
              className="mt-6 inline-block text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to COSMOVATE
            </Link>
          </section>
        )}

        <footer className="mt-8 text-center text-[10px] tracking-wider text-slate-600">
          COSMOVATE · EXPLORE. INNOVATE. DISCOVER.
        </footer>
      </div>
    </main>
  );
}
