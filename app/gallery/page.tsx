"use client";

import { TouchEvent, useEffect, useMemo, useState } from "react";

type Photo = { id: string; image_url: string; credit: string | null; photo_order: number };
type Album = { id: string; title: string; description: string | null; category: string; is_featured: boolean; photos: Photo[] };
const categories = ["All", "Nebulae", "Galaxies", "Planets", "Black Holes", "Stars", "Missions", "Other"];

export default function SpaceGalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Album | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/gallery", { cache: "no-store" }).then(async (response) => {
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to load the gallery.");
      if (active) setAlbums(result.images ?? []);
    }).catch((err) => { if (active) setError(err instanceof Error ? err.message : "Unable to load the gallery."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleAlbums = useMemo(() => {
    const term = search.trim().toLowerCase();
    return albums.filter((album) => (category === "All" || album.category === category) && (!term || [album.title, album.description ?? "", album.category, ...album.photos.map((photo) => photo.credit ?? "")].some((value) => value.toLowerCase().includes(term))));
  }, [albums, category, search]);

  function openAlbum(album: Album) { setSelected(album); setPhotoIndex(0); }
  function closeAlbum() { setSelected(null); setPhotoIndex(0); }
  function changePhoto(delta: number) { if (!selected) return; setPhotoIndex((current) => (current + delta + selected.photos.length) % selected.photos.length); }
  function onTouchStart(event: TouchEvent<HTMLDivElement>) { setTouchStart(event.changedTouches[0]?.clientX ?? null); }
  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null) return;
    const difference = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(difference) > 45) changePhoto(difference < 0 ? 1 : -1);
    setTouchStart(null);
  }
  useEffect(() => {
    if (!selected) return;
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") closeAlbum(); if (event.key === "ArrowRight") changePhoto(1); if (event.key === "ArrowLeft") changePhoto(-1); }
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const activePhoto = selected?.photos[photoIndex];
  return <main className="min-h-screen overflow-hidden bg-[#050b16] text-white">
    <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]"/><div className="absolute -right-40 top-96 h-96 w-96 rounded-full bg-violet-500/10 blur-[130px]"/><div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-500/[0.07] blur-[130px]"/></div>
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"><a href="/" className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-2xl">🌌</span><span><span className="block text-lg font-black tracking-[0.16em]">COSMOVATE</span><span className="block text-[9px] tracking-[0.3em] text-slate-500">SPACE GALLERY</span></span></a><a href="/" className="text-xs font-semibold text-slate-400 transition hover:text-white">← Back to Homepage</a></header>
      <section className="relative py-14 sm:py-20"><div className="absolute right-0 top-5 hidden text-[130px] opacity-[0.07] sm:block">🪐</div><p className="text-[10px] font-bold tracking-[0.25em] text-cyan-300">A WINDOW INTO THE COSMOS</p><h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">THE UNIVERSE,<br/><span className="bg-linear-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">IN EVERY FRAME.</span></h1><p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">A curated collection of cosmic imagery, selected and uploaded by the COSMOVATE team.</p><div className="mt-7 flex flex-wrap gap-3"><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-[10px] font-bold tracking-widest text-cyan-100">TEAM-CURATED IMAGES</span><span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-bold tracking-widest text-slate-400">{albums.length} OBJECTS · {albums.reduce((sum, album) => sum + album.photos.length, 0)} PHOTOS</span></div></section>
      <section className="mb-8"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-4 py-3 text-xs font-semibold transition ${category === item ? "border-cyan-300/50 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white"}`}>{item}</button>)}</div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this collection..." className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50 md:max-w-xs"/></div></section>
      <section className="mb-14">{loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-white/[0.06]"/>)}</div> : error ? <div className="rounded-2xl border border-red-300/15 bg-red-400/5 p-6 text-sm text-red-200">{error}</div> : visibleAlbums.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center"><p className="text-5xl">🌌</p><h2 className="mt-5 text-xl font-bold">{albums.length === 0 ? "The gallery is waiting for its first discovery." : "No matching objects found."}</h2><p className="mt-2 text-sm text-slate-400">{albums.length === 0 ? "The COSMOVATE team will add images here soon." : "Try another category or search term."}</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleAlbums.map((album) => <button key={album.id} onClick={() => openAlbum(album)} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0a1729] text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-xl hover:shadow-cyan-950/20"><div className="relative aspect-[4/5] overflow-hidden bg-black/30"><img src={album.photos[0]?.image_url} alt={album.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#050b16]/90 via-transparent to-transparent opacity-90"/>{album.is_featured && <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[9px] font-bold tracking-widest text-cyan-100 backdrop-blur">FEATURED</span>}<span className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[9px] font-bold text-white backdrop-blur">{album.photos.length} PHOTO{album.photos.length === 1 ? "" : "S"}</span><span className="absolute bottom-4 left-4 right-4 line-clamp-2 text-sm font-bold leading-5 text-white">{album.title}</span></div><div className="flex items-center justify-between gap-3 px-4 py-3 text-[10px] text-slate-500"><span className="truncate">{album.category}</span><span className="shrink-0">SWIPE TO EXPLORE ↗</span></div></button>)}</div>}</section>
      <footer className="border-t border-white/10 py-8 text-center"><p className="text-xs font-bold tracking-[0.25em] text-slate-400">COSMOVATE · SPACE GALLERY</p><p className="mt-3 text-[10px] text-slate-600">Curated with curiosity by the COSMOVATE team.</p><a href="/" className="mt-5 inline-block text-xs text-cyan-300 hover:text-white">Return to COSMOVATE homepage ↑</a></footer>
    </div>
    {selected && activePhoto && <div role="dialog" aria-modal="true" aria-label={selected.title} onClick={closeAlbum} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-8"><div onClick={(event) => event.stopPropagation()} className="relative grid max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#081426] lg:grid-cols-[1.4fr_1fr]"><div className="relative flex min-h-[260px] items-center justify-center bg-black" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}><img src={activePhoto.image_url} alt={selected.title} className="max-h-[68vh] w-full object-contain lg:max-h-[85vh]"/>{selected.photos.length > 1 && <><button onClick={() => changePhoto(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-4 py-3 text-xl text-white backdrop-blur hover:bg-black/90">‹</button><button onClick={() => changePhoto(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 px-4 py-3 text-xl text-white backdrop-blur hover:bg-black/90">›</button></>}</div><div className="overflow-y-auto p-6 sm:p-8"><div className="flex items-start justify-between gap-4"><p className="text-[10px] font-bold tracking-[0.25em] text-cyan-300">{selected.category.toUpperCase()}</p><button onClick={closeAlbum} aria-label="Close gallery viewer" className="rounded-full border border-white/15 px-3 py-1 text-lg text-slate-300 transition hover:bg-white/10 hover:text-white">×</button></div><h2 className="mt-6 text-2xl font-black leading-tight">{selected.title}</h2><p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-slate-400">{selected.description || "No description provided."}</p><div className="mt-6 border-t border-white/10 pt-5"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-300">Photo {photoIndex + 1} of {selected.photos.length}</span><span className="text-slate-500">{activePhoto.credit ? `Credit: ${activePhoto.credit}` : "Credit not provided"}</span></div>{selected.photos.length > 1 && <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{selected.photos.map((photo, index) => <button key={photo.id} onClick={() => setPhotoIndex(index)} aria-label={`Show photo ${index + 1}`} className={`h-14 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${index === photoIndex ? "border-cyan-300" : "border-white/10 opacity-60 hover:opacity-100"}`}><img src={photo.image_url} alt="" className="h-full w-full object-cover"/></button>)}</div>}<p className="mt-3 text-[10px] text-slate-600">Swipe on the image or use the arrows to explore this object.</p></div></div></div></div>}
  </main>;
}
