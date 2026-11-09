
"use client";

import { useEffect, useState } from "react";

const events = [
  { date: "2026-11-12", title: "Northern Taurids", type: "Meteor shower", icon: "☄️", detail: "A modest shower; around five meteors per hour under ideal conditions." },
  { date: "2026-11-16", title: "Mars & Jupiter close approach", type: "Planetary event", icon: "🪐", detail: "The planets appear close together before sunrise." },
  { date: "2026-11-17", title: "Leonids Meteor Shower", type: "Meteor shower", icon: "🌠", detail: "Look before dawn, after moonset, from a dark location." },
  { date: "2026-11-24", title: "Full Moon · Supermoon", type: "Moon phase", icon: "🌕", detail: "November's full supermoon." },
  { date: "2026-11-25", title: "Uranus at Opposition", type: "Planetary event", icon: "🔭", detail: "Uranus is opposite the Sun in Earth's sky; binoculars or a telescope are needed." },
  { date: "2026-12-09", title: "New Moon", type: "Moon phase", icon: "🌑", detail: "A dark-sky window around the New Moon." },
  { date: "2026-12-13", title: "Geminids Meteor Shower", type: "Meteor shower", icon: "✨", detail: "One of the year's strongest annual meteor showers; peak night 13–14 December." },
  { date: "2026-12-24", title: "Full Moon · Supermoon", type: "Moon phase", icon: "🌕", detail: "Christmas Eve full supermoon." },
];

export default function CelestialCalendarPreview() {
  const [upcoming, setUpcoming] = useState<typeof events>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredEvents = events
      .filter((event) => {
        const eventDate = new Date(`${event.date}T00:00:00`);
        return eventDate >= today;
      })
      .slice(0, 4);

    setUpcoming(filteredEvents);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[#071426] px-5 py-8 text-white shadow-2xl shadow-blue-950/20">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <p className="text-[10px] font-bold tracking-[0.28em] text-cyan-300">
            COSMOVATE · CELESTIAL CALENDAR 2026
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Your next date
            <br />
            <span className="bg-gradient-to-r from-cyan-200 to-violet-300 bg-clip-text text-transparent">
              with the cosmos.
            </span>
          </h2>

          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-400">
            Moon phases, meteor showers, planetary encounters and eclipses —
            all in one skywatching calendar.
          </p>

          <a
            href="/celestial-calendar"
            className="mt-7 inline-flex items-center gap-3 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-6 py-3 text-xs font-black tracking-wider text-cyan-100 transition hover:bg-cyan-300/20"
          >
            OPEN CELESTIAL CALENDAR <span>↗</span>
          </a>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-slate-300">
              UP NEXT
            </span>
            <span className="text-[10px] text-slate-500">
              NOV — DEC 2026
            </span>
          </div>

          <div className="space-y-3">
            {upcoming.length ? (
              upcoming.map((event) => (
                <div
                  key={event.date + event.title}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-xl">
                    {event.icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {event.title}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {new Date(`${event.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" }
                      )}
                      {" · "}
                      {event.type}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                The 2026 calendar is complete. Explore the full archive.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
