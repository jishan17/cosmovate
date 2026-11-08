
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "cosmovate_guest_explorer";
const QUESTION_TIME = 20;

const questions = [
  {
    question: "Which star is at the centre of our Solar System?",
    options: ["Sirius", "The Sun", "Polaris", "Alpha Centauri"],
    answer: 1,
    explanation:
      "The Sun is the star at the centre of our Solar System. Its gravity keeps the planets in orbit.",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Mercury"],
    answer: 2,
    explanation:
      "Mars appears reddish because iron minerals in its surface soil have oxidised, or rusted.",
  },
  {
    question: "What is the largest planet in our Solar System?",
    options: ["Saturn", "Neptune", "Earth", "Jupiter"],
    answer: 3,
    explanation:
      "Jupiter is the largest planet in our Solar System, with a diameter of about 143,000 kilometres.",
  },
  {
    question: "Which galaxy contains our Solar System?",
    options: ["Andromeda", "Milky Way", "Sombrero", "Whirlpool"],
    answer: 1,
    explanation:
      "Our Solar System is located in the Milky Way galaxy, in a region called the Orion Arm.",
  },
  {
    question: "What is the name of Earth's natural satellite?",
    options: ["Titan", "Europa", "The Moon", "Phobos"],
    answer: 2,
    explanation:
      "The Moon is Earth's only natural satellite and takes approximately 27.3 days to orbit Earth.",
  },
  {
    question: "Which planet has the most prominent ring system?",
    options: ["Mars", "Saturn", "Earth", "Mercury"],
    answer: 1,
    explanation:
      "Saturn has the most spectacular and extensive ring system, made mostly of ice particles and rocky debris.",
  },
  {
    question: "What is the closest planet to the Sun?",
    options: ["Venus", "Earth", "Mars", "Mercury"],
    answer: 3,
    explanation:
      "Mercury is the closest planet to the Sun. It completes one orbit in approximately 88 Earth days.",
  },
  {
    question:
      "What do we call a rocky object that enters Earth's atmosphere and produces a streak of light?",
    options: ["Meteor", "Comet", "Asteroid", "Satellite"],
    answer: 0,
    explanation:
      "A meteor is the streak of light produced when a meteoroid enters an atmosphere and heats up.",
  },
  {
    question: "Which planet is famous for its Great Red Spot?",
    options: ["Neptune", "Jupiter", "Uranus", "Venus"],
    answer: 1,
    explanation:
      "Jupiter's Great Red Spot is a gigantic, long-lasting storm in its atmosphere.",
  },
  {
    question: "Approximately how long does Earth take to orbit the Sun?",
    options: ["24 hours", "30 days", "365.25 days", "10 years"],
    answer: 2,
    explanation:
      "Earth takes approximately 365.25 days to complete one orbit around the Sun. This is why leap years exist.",
  },
];

type GuestProfile = {
  id: string;
  displayName: string;
  totalXP: number;
};

export default function AstronomyQuizPage() {
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

    const correct = choice === question.answer;

    setSelected(choice);

    if (correct) {
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

  // Save XP once when the quiz is completed.
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
          <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-[10px] font-bold tracking-[0.2em] text-cyan-200">
            MISSION 01 · ASTRONOMY
          </span>

          <h1 className="mt-6 text-3xl font-black sm:text-5xl">
            Astronomy Quiz
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            Test your knowledge of the universe.
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
                ? "Outstanding Explorer!"
                : score >= 5
                  ? "Great Discovery!"
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
                <p className="text-xs text-slate-400">
                  EXPERIENCE EARNED
                </p>

                <p className="mt-2 text-2xl font-black text-amber-300">
                  +{xpEarned} XP
                </p>

                {saveError ? (
                  <p className="mt-3 text-xs text-red-300">
                    Your XP could not be saved in this browser. Please check
                    your browser storage settings.
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
