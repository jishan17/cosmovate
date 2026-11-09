 "use client";

import { useCallback, useEffect, useState } from "react";
import CelestialCalendarPreview from "../components/CelestialCalendarPreview";

type ISSData = {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
};

type APODData = {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
};

type Launch = {
  id: string;
  name: string;
  net: string;
  status?: { name?: string };
  image?: string;
  launch_service_provider?: { name?: string };
  pad?: { location?: { name?: string } };
  mission?: { description?: string };
  url?: string;
};

type SpaceWeather = {
  kp: number | null;
  kpTime: string | null;
  xrayClass: string | null;
  xrayTime: string | null;
};

type APIState = "loading" | "live" | "error";

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date not available";
  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function countdown(target: string, now: number) {
  const difference = new Date(target).getTime() - now;
  if (!Number.isFinite(difference)) return "Time not available";
  if (difference <= 0) return "Launch window reached / status update pending";
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold tracking-[0.25em] text-cyan-300">{children}</p>;
}

function Loading({ text }: { text: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-slate-400">
      <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
      {text}
    </div>
  );
}

function StatusPill({ state }: { state: APIState }) {
  const styles =
    state === "live"
      ? "bg-emerald-400/10 text-emerald-300"
      : state === "error"
        ? "bg-red-400/10 text-red-300"
        : "bg-amber-400/10 text-amber-200";

  return (
    <span className={`rounded-full px-3 py-1 text-[9px] font-bold tracking-widest ${styles}`}>
      {state === "live" ? "LIVE DATA" : state === "error" ? "UNAVAILABLE" : "CONNECTING"}
    </span>
  );
}

export default function LiveSpaceUpdatesPage() {
  const [iss, setIss] = useState<ISSData | null>(null);
  const [apod, setApod] = useState<APODData | null>(null);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [weather, setWeather] = useState<SpaceWeather>({
    kp: null,
    kpTime: null,
    xrayClass: null,
    xrayTime: null,
  });

  const [issState, setIssState] = useState<APIState>("loading");
  const [apodState, setApodState] = useState<APIState>("loading");
  const [launchState, setLaunchState] = useState<APIState>("loading");
  const [weatherState, setWeatherState] = useState<APIState>("loading");

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Start with a stable value; read the current time after the client mounts.
  const [clock, setClock] = useState(0);

  const loadISS = useCallback(async () => {
    try {
      const response = await fetch("https://api.wheretheiss.at/v1/satellites/25544", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("ISS service unavailable");
      const data = await response.json();
      if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
        throw new Error("Invalid ISS coordinates");
      }
      setIss(data);
      setIssState("live");
    } catch {
      setIssState("error");
    }
  }, []);

  const loadAPOD = useCallback(async () => {
    try {
      const response = await fetch("https://science.nasa.gov/wp-json/wp/v2/apod-basic", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("NASA APOD unavailable");
      const data = await response.json();
      if (!data?.title || !data?.url) throw new Error("Invalid APOD response");
      setApod(data);
      setApodState("live");
    } catch {
      setApodState("error");
    }
  }, []);

  const loadLaunches = useCallback(async () => {
    try {
      const response = await fetch(
        "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=6&mode=list&hide_recent_previous=true",
        { cache: "no-store" }
      );
      if (!response.ok) throw new Error("Launch service unavailable");
      const data = await response.json();
      setLaunches(Array.isArray(data.results) ? data.results : []);
      setLaunchState("live");
    } catch {
      setLaunchState("error");
    }
  }, []);

  const loadSpaceWeather = useCallback(async () => {
    try {
      const [kpResponse, xrayResponse] = await Promise.all([
        fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json", {
          cache: "no-store",
        }),
        fetch("https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json", {
          cache: "no-store",
        }),
      ]);

      if (!kpResponse.ok || !xrayResponse.ok) throw new Error("NOAA service unavailable");

      const kpRows = await kpResponse.json();
      const xrayRows = await xrayResponse.json();

      const latestKp = Array.isArray(kpRows) ? [...kpRows].reverse().find(
        (row: unknown[]) => row.length > 1 && Number.isFinite(Number(row[1]))
      ) : null;

      const latestXray = Array.isArray(xrayRows) ? [...xrayRows].reverse().find(
        (row: { flux?: number; time_tag?: string; energy?: string }) =>
          row.energy === "0.1-0.8nm" && Number.isFinite(Number(row.flux)) && Number(row.flux) > 0
      ) : null;

      let xrayClass: string | null = null;
      if (latestXray?.flux) {
        const flux = Number(latestXray.flux);
        const level = flux >= 1e-4 ? "X" : flux >= 1e-5 ? "M" : flux >= 1e-6 ? "C" : flux >= 1e-7 ? "B" : "A";
        const base = level === "X" ? 1e-4 : level === "M" ? 1e-5 : level === "C" ? 1e-6 : level === "B" ? 1e-7 : 1e-8;
        xrayClass = `${level}${(flux / base).toFixed(1)}`;
      }

      setWeather({
        kp: latestKp ? Number(latestKp[1]) : null,
        kpTime: latestKp ? String(latestKp[0]) : null,
        xrayClass,
        xrayTime: latestXray?.time_tag || null,
      });
      setWeatherState(latestKp || latestXray ? "live" : "error");
    } catch {
      setWeatherState("error");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadISS(), loadAPOD(), loadLaunches(), loadSpaceWeather()]);
    setLastUpdated(new Date());
    setRefreshing(false);
  }, [loadISS, loadAPOD, loadLaunches, loadSpaceWeather]);

  useEffect(() => {
    setClock(Date.now());
    refreshAll();
    const issTimer = window.setInterval(loadISS, 5000);
    const weatherTimer = window.setInterval(loadSpaceWeather, 5 * 60 * 1000);
    const launchTimer = window.setInterval(loadLaunches, 10 * 60 * 1000);
    const clockTimer = window.setInterval(() => setClock(Date.now()), 1000);

    return () => {
      window.clearInterval(issTimer);
      window.clearInterval(weatherTimer);
      window.clearInterval(launchTimer);
      window.clearInterval(clockTimer);
    };
  }, [refreshAll, loadISS, loadSpaceWeather, loadLaunches]);

  const liveCount = [issState, apodState, launchState, weatherState].filter(
    (state) => state === "live"
  ).length;

  const mapUrl = iss
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${iss.longitude - 12}%2C${iss.latitude - 8}%2C${iss.longitude + 12}%2C${iss.latitude + 8}&layer=mapnik&marker=${iss.latitude}%2C${iss.longitude}`
    : null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#050b16] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute -right-40 top-96 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-600/[0.07] blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-2xl">
              🛰️
            </span>
            <span>
              <span className="block text-lg font-black tracking-[0.16em]">COSMOVATE</span>
              <span className="block text-[9px] tracking-[0.3em] text-slate-500">LIVE SPACE UPDATES</span>
            </span>
          </a>
          <a href="/" className="text-xs font-semibold text-slate-400 transition hover:text-white">
            ← Back to Homepage
          </a>
        </header>

        <section className="relative py-14 sm:py-20">
          <div className="absolute right-0 top-10 hidden text-[130px] opacity-[0.07] sm:block">🪐</div>
          <SectionLabel>YOUR WINDOW INTO THE UNIVERSE</SectionLabel>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
            LIVE SPACE<br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              UPDATES.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Track humanity&apos;s journey beyond Earth. Follow the International Space Station,
            explore NASA&apos;s cosmic imagery and monitor conditions across near-Earth space.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={refreshAll}
              disabled={refreshing}
              className="rounded-xl bg-cyan-500 px-6 py-3 text-xs font-black tracking-wider text-[#04111d] transition hover:bg-cyan-300 disabled:opacity-50"
            >
              {refreshing ? "UPDATING..." : "↻ REFRESH ALL DATA"}
            </button>
            <span className="text-xs text-slate-500">
              {lastUpdated ? `Last full sync: ${lastUpdated.toLocaleTimeString("en-IN")}` : "Connecting to space data..."}
            </span>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["DATA SOURCES", `${liveCount}/4 ONLINE`],
            ["ISS TRACKING", issState === "live" ? "ACTIVE" : issState.toUpperCase()],
            ["SPACE WEATHER", weatherState === "live" ? "MONITORING" : weatherState.toUpperCase()],
            ["LOCAL CLOCK", new Date(clock).toLocaleTimeString("en-IN")],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[9px] tracking-widest text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-bold text-cyan-200">{value}</p>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionLabel>01 / LIVE SATELLITE TRACKING</SectionLabel>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Where is the ISS?</h2>
            </div>
            <StatusPill state={issState} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#0a1729]">
              {mapUrl ? (
                <iframe
                  title="Live International Space Station position map"
                  src={mapUrl}
                  className="h-[330px] w-full border-0 sm:h-[420px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-[330px] items-center justify-center">
                  <Loading text="Acquiring ISS coordinates for map..." />
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-3 text-[10px] text-slate-400">
                <span>Interactive OpenStreetMap · Marker shows latest reported ISS coordinates</span>
                {iss && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${iss.latitude}&mlon=${iss.longitude}#map=3/${iss.latitude}/${iss.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-cyan-300 hover:text-white"
                  >
                    OPEN FULL MAP ↗
                  </a>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0a1729] p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold tracking-widest text-slate-400">INTERNATIONAL SPACE STATION</p>
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              </div>

              {issState === "loading" && <Loading text="Acquiring satellite coordinates..." />}
              {issState === "error" && (
                <p className="mt-8 text-sm leading-6 text-red-300">
                  Unable to retrieve the ISS position. The last successful position, if available, may still be shown.
                </p>
              )}

              {iss && (
                <>
                  <div className="mt-7 grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-[10px] text-slate-500">LATITUDE</p>
                      <p className="mt-2 text-xl font-black text-cyan-200">{iss.latitude.toFixed(3)}°</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">LONGITUDE</p>
                      <p className="mt-2 text-xl font-black text-cyan-200">{iss.longitude.toFixed(3)}°</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">ALTITUDE</p>
                      <p className="mt-2 text-xl font-black">{iss.altitude.toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">VELOCITY</p>
                      <p className="mt-2 text-xl font-black">{Math.round(iss.velocity).toLocaleString("en-IN")} km/h</p>
                    </div>
                  </div>
                  <p className="mt-6 text-[10px] text-slate-500">
                    Position timestamp: {new Date(iss.timestamp * 1000).toLocaleTimeString("en-IN")}
                  </p>
                </>
              )}
              <p className="mt-6 border-t border-white/10 pt-4 text-[10px] leading-5 text-slate-500">
                Position refreshes approximately every 5 seconds while this page is open. Values depend on the upstream tracking service.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionLabel>02 / NASA ASTRONOMY PICTURE OF THE DAY</SectionLabel>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">The universe, captured.</h2>
            </div>
            <StatusPill state={apodState} />
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a1729]">
            {apodState === "loading" && <Loading text="Receiving NASA's featured cosmic image..." />}
            {apodState === "error" && (
              <div className="p-8 text-sm text-red-300">
                NASA&apos;s image service is temporarily unavailable. Try refreshing later.
              </div>
            )}
            {apod && (
              <div className="grid lg:grid-cols-2">
                <div className="flex min-h-[260px] items-center justify-center bg-black/30">
                  {apod.media_type === "image" ? (
                    <img
                      src={apod.hdurl || apod.url}
                      alt={apod.title}
                      className="h-full max-h-[470px] w-full object-cover"
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-5xl">🎥</p>
                      <a href={apod.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-bold text-cyan-300 underline">
                        View today&apos;s NASA feature ↗
                      </a>
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-9">
                  <p className="text-[10px] font-bold tracking-widest text-cyan-300">NASA · {apod.date}</p>
                  <h3 className="mt-4 text-2xl font-black leading-tight">{apod.title}</h3>
                  <p className="mt-5 max-h-52 overflow-y-auto text-sm leading-7 text-slate-400">{apod.explanation}</p>
                  {apod.copyright && <p className="mt-4 text-xs text-slate-500">Image credit: {apod.copyright}</p>}
                  <a href={apod.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-xs font-bold tracking-widest text-cyan-300 hover:text-white">
                    EXPLORE ON NASA ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionLabel>03 / UPCOMING SPACEFLIGHT</SectionLabel>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Next rocket launches.</h2>
              <p className="mt-2 text-sm text-slate-500">Launch schedules are subject to change. Countdown uses the published NET time.</p>
            </div>
            <StatusPill state={launchState} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {launchState === "loading" && <div className="col-span-full"><Loading text="Retrieving upcoming launch schedules..." /></div>}
            {launchState === "error" && (
              <div className="col-span-full rounded-2xl border border-red-300/10 bg-red-400/5 p-6 text-sm text-red-300">
                The launch database is temporarily unavailable. Please try again later.
              </div>
            )}
            {launchState === "live" && launches.length === 0 && (
              <div className="col-span-full rounded-2xl border border-white/10 p-6 text-sm text-slate-400">No upcoming launches are currently listed.</div>
            )}
            {launches.map((launch) => (
              <article key={launch.id} className="rounded-2xl border border-white/10 bg-[#0a1729] p-5 transition hover:border-cyan-300/30">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] font-bold tracking-widest text-cyan-300">SPACEFLIGHT</span>
                  <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[9px] text-slate-300">{launch.status?.name || "Status not listed"}</span>
                </div>
                <h3 className="mt-5 text-lg font-bold leading-snug">{launch.name}</h3>
                <p className="mt-3 text-xs leading-6 text-slate-400">{launch.launch_service_provider?.name || "Launch provider not listed"}</p>
                {launch.mission?.description && <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500">{launch.mission.description}</p>}
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[9px] tracking-widest text-slate-500">PUBLISHED LAUNCH TIME</p>
                  <p className="mt-2 text-sm font-bold text-cyan-100">{formatDate(launch.net)}</p>
                  <p className="mt-3 text-[9px] tracking-widest text-slate-500">COUNTDOWN</p>
                  <p className="mt-1 text-sm font-bold text-amber-200">{countdown(launch.net, clock)}</p>
                  {launch.pad?.location?.name && <p className="mt-3 text-xs text-slate-500">📍 {launch.pad.location.name}</p>}
                </div>
                {launch.url && (
                  <a href={launch.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-[10px] font-bold tracking-widest text-cyan-300 hover:text-white">
                    LAUNCH DETAILS ↗
                  </a>
                )}
              </article>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-slate-600">
            Launch data: The Space Devs · Launch Library 2. Non-authenticated API access is rate-limited.
          </p>
        </section>

        <section className="mb-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionLabel>04 / SPACE WEATHER MONITOR</SectionLabel>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">The Sun is always active.</h2>
              <p className="mt-2 text-sm text-slate-500">Recent geomagnetic and solar X-ray observations from NOAA SWPC.</p>
            </div>
            <StatusPill state={weatherState} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-[#0a1729] p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-500">PLANETARY K-INDEX</p>
              {weatherState === "loading" && <Loading text="Reading geomagnetic data..." />}
              {weatherState === "error" && weather.kp === null && <p className="mt-5 text-sm text-slate-400">K-index data is currently unavailable.</p>}
              {weather.kp !== null && (
                <>
                  <p className="mt-4 text-4xl font-black text-cyan-200">{weather.kp.toFixed(1)} <span className="text-sm text-slate-500">/ 9</span></p>
                  <p className="mt-3 text-xs text-slate-400">
                    {weather.kp < 5 ? "Below geomagnetic storm threshold in this reported interval." : "At or above the NOAA geomagnetic storm threshold."}
                  </p>
                  {weather.kpTime && <p className="mt-3 text-[10px] text-slate-600">Observation: {new Date(weather.kpTime).toLocaleString("en-IN")}</p>}
                </>
              )}
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#0a1729] p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-500">SOLAR X-RAY FLUX</p>
              {weatherState === "loading" && <Loading text="Reading solar X-ray data..." />}
              {weatherState === "error" && weather.xrayClass === null && <p className="mt-5 text-sm text-slate-400">Solar X-ray data is currently unavailable.</p>}
              {weather.xrayClass && (
                <>
                  <p className="mt-4 text-4xl font-black text-amber-200">{weather.xrayClass}</p>
                  <p className="mt-3 text-xs text-slate-400">Latest available GOES X-ray classification from the 0.1–0.8 nm band.</p>
                  {weather.xrayTime && <p className="mt-3 text-[10px] text-slate-600">Observation: {new Date(weather.xrayTime).toLocaleString("en-IN")}</p>}
                </>
              )}
            </article>
          </div>
          <p className="mt-4 text-[10px] leading-5 text-slate-600">
            Source: NOAA Space Weather Prediction Center. K-index is a geomagnetic activity indicator; X-ray class describes solar X-ray flux. These readings are not a forecast or an aurora guarantee.
          </p>
        </section>

        <section className="mb-12">
          <CelestialCalendarPreview />
        </section>

        <footer className="border-t border-white/10 py-8 text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-slate-400">COSMOVATE · LIVE SPACE UPDATES</p>
          <p className="mt-3 text-[10px] text-slate-600">Explore. Innovate. Discover.</p>
          <a href="/" className="mt-5 inline-block text-xs text-cyan-300 hover:text-white">Return to COSMOVATE homepage ↑</a>
        </footer>
      </div>
    </main>
  );
}
