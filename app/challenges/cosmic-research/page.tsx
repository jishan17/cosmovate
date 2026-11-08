
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cosmovate_guest_explorer";
const QUESTION_TIME = 20;

const questions = [
  {
    question: "What is an exoplanet?",
    options: [
      "A planet outside our Solar System",
      "A moon orbiting Jupiter",
      "A star that has exploded",
      "A planet without an atmosphere",
    ],
    answer: 0,
    explanation:
      "Exoplanets are planets that orbit stars other than our Sun. Thousands have been confirmed.",
  },
  {
    question: "What is dark matter?",
    options: [
      "A type of black hole",
      "Matter that emits visible light",
      "An invisible form of matter inferred through gravity",
      "A cloud of cosmic dust",
    ],
    answer: 2,
    explanation:
      "Dark matter does not emit or reflect light in a way we can detect directly. Its gravitational effects reveal its presence.",
  },
  {
    question: "What does a black hole's event horizon represent?",
    options: [
      "Its outer atmosphere",
      "The boundary beyond which escape is impossible",
      "The centre of its accretion disk",
      "The point where stars are born",
    ],
    answer: 1,
    explanation:
      "The event horizon is the boundary beyond which nothing, not even light, can escape the black hole.",
  },
  {
    question: "What is the Cosmic Microwave Background (CMB)?",
    options: [
      "Radiation from the Sun",
      "Radiation left over from the early universe",
      "Signals from alien civilisations",
      "Heat emitted by black holes",
    ],
    answer: 1,
    explanation:
      "The CMB is ancient radiation released when the universe became transparent, approximately 380,000 years after the Big Bang.",
  },
  {
    question: "What can gravitational waves tell scientists?",
    options: [
      "The chemical composition of planets",
      "The movement of ocean currents",
      "The acceleration of light",
      "Events involving massive accelerating objects",
    ],
    answer: 3,
    explanation:
      "Gravitational waves are ripples in spacetime produced by accelerating massive objects, such as merging black holes.",
  },
  {
    question: "What is the main purpose of spectroscopy in astronomy?",
    options: [
      "To measure the age of every planet directly",
      "To study the light from celestial objects",
      "To photograph objects inside black holes",
      "To measure Earth's magnetic field",
    ],
    answer: 1,
    explanation:
      "Spectroscopy separates light into its component wavelengths, helping scientists identify chemical elements, temperatures and motion.",
  },
  {
    question: "What does a redshift in a distant galaxy's light usually indicate?",
    options: [
      "The galaxy is moving away from us",
      "The galaxy is becoming hotter",
      "The galaxy has stopped moving",
      "The galaxy is getting smaller",
    ],
    answer: 0,
    explanation:
      "Cosmological redshift occurs as space expands, stretching the wavelength of light travelling across the universe.",
  },
  {
    question: "Which observation provides strong evidence that the universe is expanding?",
    options: [
      "The phases of the Moon",
      "The changing seasons",
      "The redshift of distant galaxies",
      "The rotation of Earth",
    ],
    answer: 2,
    explanation:
      "The redshift observed in distant galaxies shows that, on large scales, galaxies are generally moving away from one another.",
  },
  {
    question: "What is gravitational lensing?",
    options: [
      "A telescope's optical distortion",
      "The bending of light due to gravity",
      "A reflection caused by cosmic dust",
      "The explosion of a massive star",
    ],
    answer: 1,
    explanation:
      "Massive objects bend spacetime and can deflect light from objects behind them, acting like cosmic lenses.",
  },
  {
    question: "Which observatory detected the first direct evidence of gravitational waves?",
    options: [
      "Hubble",
      "Chandra",
      "Kepler",
      "LIGO",
    ],
    answer: 3,
    explanation:
      "LIGO announced the first direct detection of gravitational waves in 2016, from a black hole merger detected in September 2015.",
  },
];

type GuestProfile = {
  id: string;
  displayName: string;
  totalXP: number;
};

export default function CosmicResearchQuizPage() {
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

      const xpEarned = score * 10;
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
            MISSION 04 · COSMIC RESEARCH
          </span>

          <h1 className="mt-6 text-3xl font-black sm:text-5xl">
            Cosmic Research
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Investigate the mysteries of the universe. Think like a scientist.
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
                  timeLeft <= 5 ? "text-red-400" : "text-violet-200"
                }`}
              >
                ⏱ {timeLeft}s
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300 transition-all"
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
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
                  "border-white/10 bg-white/[0.03] hover:border-violet-300/40 hover:bg-violet-400/[0.06]";

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
              <div className="mt-6 rounded-xl border border-violet-300/15 bg-violet-400/[0.06] p-4">
                <p className="text-sm font-bold text-violet-200">
                  {selected === question.answer
                    ? "Correct answer! +10 XP"
                    : selected === -1
                      ? "Time's up! Keep investigating."
                      : "Not quite! Keep investigating."}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {question.explanation}
                </p>

                <button
                  onClick={nextQuestion}
                  className="mt-5 w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold transition hover:bg-violet-500"
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
          <section className="rounded-3xl border border-violet-300/20 bg-[#0a1729]/95 p-7 text-center shadow-2xl shadow-blue-950/20 sm:p-10">
            <div className="text-6xl">🔬</div>

            <p className="mt-6 text-xs font-bold tracking-[0.25em] text-violet-200">
              RESEARCH COMPLETE
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              {score >= 8
                ? "Genius Researcher!"
                : score >= 5
                  ? "Discovery Unlocked!"
                  : "Keep Investigating!"}
            </h2>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-slate-400">YOUR FINAL SCORE</p>

              <p className="mt-2 text-5xl font-black text-violet-200">
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
                    Saving your researcher progress...
                  </p>
                )}
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                onClick={restartQuiz}
                className="rounded-xl bg-violet-600 px-5 py-3 font-bold transition hover:bg-violet-500"
              >
                Play Again
              </button>

              <Link
                href="/challenges"
                className="rounded-xl border border-violet-300/30 bg-violet-400/10 px-5 py-3 font-bold text-violet-200 transition hover:bg-violet-400/20"
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
