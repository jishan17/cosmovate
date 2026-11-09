"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type Photo = { id: string; image_url: string; storage_path: string; credit: string | null; photo_order: number };
type Album = { id: string; title: string; description: string | null; category: string; is_featured: boolean; display_order: number; photos: Photo[] };
const CATEGORIES = ["Nebulae", "Galaxies", "Planets", "Black Holes", "Stars", "Missions", "Other"];
const emptyForm = { title: "", description: "", category: "Nebulae", is_featured: false, display_order: "0" };

export default function GalleryManager() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [credits, setCredits] = useState<string[]>([]);
  const [editing, setEditing] = useState<Album | null>(null);
  const [addingTo, setAddingTo] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/gallery", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load gallery.");
      setAlbums(result.images ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load gallery."); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  function reset() { setEditing(null); setAddingTo(null); setFiles([]); setCredits([]); setForm(emptyForm); }
  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? []);
    setFiles(chosen);
    setCredits(chosen.map(() => ""));
  }
  function startEdit(album: Album) {
    setEditing(album); setAddingTo(null); setFiles([]); setCredits([]);
    setForm({ title: album.title, description: album.description ?? "", category: album.category, is_featured: album.is_featured, display_order: String(album.display_order ?? 0) });
    setError(""); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function startAddPhotos(album: Album) { reset(); setAddingTo(album); setError(""); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      let response: Response;
      if (editing) {
        response = await fetch("/api/gallery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, ...form, display_order: Number(form.display_order) }) });
      } else {
        if (!files.length) throw new Error("Choose at least one photo.");
        const data = new FormData();
        files.forEach((file) => data.append("images", file));
        data.append("credits", JSON.stringify(credits));
        data.append("title", addingTo?.title ?? form.title);
        data.append("description", addingTo?.description ?? form.description);
        data.append("category", addingTo?.category ?? form.category);
        data.append("is_featured", String(addingTo?.is_featured ?? form.is_featured));
        data.append("display_order", String(addingTo?.display_order ?? Number(form.display_order)));
        if (addingTo) data.append("album_id", addingTo.id);
        response = await fetch("/api/gallery", { method: "POST", body: data });
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save gallery.");
      setMessage(editing ? "Album details updated." : addingTo ? "Photos added to album." : `Album created with ${files.length} photo(s).`);
      reset(); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setSaving(false); }
  }

  async function deleteAlbum(album: Album) {
    if (!window.confirm(`Delete the entire “${album.title}” album and all ${album.photos.length} photo(s)? This cannot be undone.`)) return;
    const response = await fetch("/api/gallery", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: album.id }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Unable to delete album."); return; }
    setMessage("Album deleted."); await refresh();
  }
  async function deletePhoto(album: Album, photo: Photo) {
    if (!window.confirm("Delete this photo from the album?")) return;
    const response = await fetch("/api/gallery", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: album.id, photo_id: photo.id }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Unable to delete photo."); return; }
    setMessage("Photo removed."); await refresh();
  }
  async function movePhoto(album: Album, index: number, direction: -1 | 1) {
    const photos = [...album.photos]; const next = index + direction;
    if (next < 0 || next >= photos.length) return;
    [photos[index], photos[next]] = [photos[next], photos[index]];
    // The album's first photo is its cover row. Keep it fixed; reorder additional photos.
    if (photos[0].id !== album.id) { setError("The cover photo stays first. Reorder the remaining photos instead."); return; }
    const response = await fetch("/api/gallery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reorder", album_id: album.id, photo_ids: photos.map((photo) => photo.id) }) });
    const result = await response.json(); if (!response.ok) { setError(result.error || "Unable to reorder photos."); return; }
    await refresh();
  }

  const isEditing = Boolean(editing);
  return <main className="min-h-screen bg-[#061326] text-white">
    <header className="border-b border-white/10 bg-[#0b1b32]"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5"><div><p className="text-sm font-bold tracking-[0.2em] text-blue-300">COSMOVATE</p><h1 className="mt-1 text-xl font-bold">Space Gallery Manager</h1></div><a href="/admin" className="text-sm text-blue-300 hover:text-white">← Admin dashboard</a></div></header>
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[420px_1fr]">
      <section className="h-fit rounded-2xl border border-white/10 bg-[#0b1b32] p-6">
        <p className="text-xs font-bold tracking-[0.2em] text-cyan-300">{editing ? "EDIT ALBUM" : addingTo ? "ADD PHOTOS TO ALBUM" : "CREATE A PHOTO ALBUM"}</p>
        <h2 className="mt-2 text-2xl font-bold">{editing ? "Edit album details" : addingTo ? `Add to ${addingTo.title}` : "Upload photos"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Select multiple JPG, PNG, WEBP or GIF photos. Each photo gets its own credit; the description is shared by the album. Maximum 10 MB per photo.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!editing && <label className="block"><span className="mb-2 block text-xs font-medium text-slate-300">Photo files *</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={chooseFiles} required className="block w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#04111d]" />
            {files.map((file, index) => <div key={`${file.name}-${index}`} className="mt-3 rounded-lg border border-white/10 p-3"><p className="truncate text-xs text-cyan-200">{file.name}</p><input value={credits[index] ?? ""} onChange={(e) => setCredits((current) => current.map((value, i) => i === index ? e.target.value : value))} maxLength={200} placeholder="Credit / photographer for this photo" className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs outline-none focus:border-cyan-300/50" /></div>)}
          </label>}
          {!addingTo && <>
            <label className="block"><span className="mb-2 block text-xs font-medium text-slate-300">Object / album name *</span><input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} required maxLength={160} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-cyan-300/50" placeholder="e.g. Eagle Nebula" /></label>
            <label className="block"><span className="mb-2 block text-xs font-medium text-slate-300">Shared description</span><textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} rows={4} maxLength={3000} className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-cyan-300/50" placeholder="Description for the entire object / album..." /></label>
            <label className="block"><span className="mb-2 block text-xs font-medium text-slate-300">Category *</span><select value={form.category} onChange={(e) => setForm((v) => ({ ...v, category: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-[#10213a] px-4 py-3 text-sm outline-none">{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-xs font-medium text-slate-300">Display order</span><input type="number" value={form.display_order} onChange={(e) => setForm((v) => ({ ...v, display_order: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none" /></label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((v) => ({ ...v, is_featured: e.target.checked }))} className="h-4 w-4 accent-cyan-400" /> Feature this album</label>
          </>}
          {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}{message && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-300">{message}</p>}
          <div className="flex gap-3"><button type="submit" disabled={saving} className="flex-1 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black tracking-widest text-[#04111d] transition hover:bg-cyan-200 disabled:opacity-50">{saving ? "SAVING..." : editing ? "SAVE ALBUM" : addingTo ? "ADD PHOTOS" : "CREATE ALBUM"}</button>{(editing || addingTo) && <button type="button" onClick={reset} className="rounded-xl border border-white/15 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-white/5">Cancel</button>}</div>
        </form>
      </section>
      <section><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.2em] text-cyan-300">YOUR CURATED COLLECTION</p><h2 className="mt-2 text-2xl font-bold">Photo albums</h2></div><span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">{albums.length} albums</span></div>
        {loading ? <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-400">Loading your collection...</p> : albums.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center"><p className="text-4xl">🌌</p><p className="mt-4 font-semibold">Your gallery is waiting for its first album.</p></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{albums.map((album) => <article key={album.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1b32]"><div className="relative aspect-[4/3] bg-black/30"><img src={album.photos[0]?.image_url} alt={album.title} className="h-full w-full object-cover" /><span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs">{album.photos.length} photo{album.photos.length === 1 ? "" : "s"}</span></div><div className="p-4"><p className="text-[10px] font-bold tracking-widest text-cyan-300">{album.category}</p><h3 className="mt-2 font-semibold">{album.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{album.description || "No description added."}</p>
          <div className="mt-4 space-y-2">{album.photos.map((photo, index) => <div key={photo.id} className="flex items-center gap-2 rounded-lg bg-black/20 p-2"><img src={photo.image_url} alt="" className="h-10 w-12 rounded object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[10px] text-slate-300">Photo {index + 1} · {photo.credit || "No credit"}</p></div>{index > 1 && <button onClick={() => movePhoto(album, index, -1)} title="Move left" className="px-1 text-slate-400 hover:text-white">↑</button>}{index < album.photos.length - 1 && index > 0 && <button onClick={() => movePhoto(album, index, 1)} title="Move right" className="px-1 text-slate-400 hover:text-white">↓</button>}<button onClick={() => deletePhoto(album, photo)} title="Remove photo" className="px-1 text-red-300 hover:text-red-100">×</button></div>)}</div>
          <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => startEdit(album)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5">Edit details</button><button onClick={() => startAddPhotos(album)} className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/10">+ Add photos</button><button onClick={() => deleteAlbum(album)} className="col-span-2 rounded-lg border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-400/10">Delete entire album</button></div>
        </div></article>)}</div>}
      </section>
    </div>
  </main>;
}
