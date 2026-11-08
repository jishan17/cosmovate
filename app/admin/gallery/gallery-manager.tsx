"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  credit: string | null;
  image_url: string;
  storage_path: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
};

const CATEGORIES = ["Nebulae", "Galaxies", "Planets", "Black Holes", "Stars", "Missions", "Other"];

const emptyForm = {
  title: "",
  description: "",
  category: "Nebulae",
  credit: "",
  is_featured: false,
  display_order: "0",
};

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refreshImages() {
    setLoading(true);
    try {
      const response = await fetch("/api/gallery", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load gallery.");
      setImages(result.images ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load gallery.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshImages();
  }, []);

  function updateField(name: string, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(image: GalleryImage) {
    setEditing(image);
    setFile(null);
    setForm({
      title: image.title,
      description: image.description ?? "",
      category: image.category,
      credit: image.credit ?? "",
      is_featured: image.is_featured,
      display_order: String(image.display_order ?? 0),
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditing(null);
    setFile(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      let response: Response;

      if (editing) {
        response = await fetch("/api/gallery", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            ...form,
            display_order: Number(form.display_order),
          }),
        });
      } else {
        if (!file) throw new Error("Choose an image to upload.");
        const data = new FormData();
        data.append("image", file);
        data.append("title", form.title);
        data.append("description", form.description);
        data.append("category", form.category);
        data.append("credit", form.credit);
        data.append("is_featured", String(form.is_featured));
        data.append("display_order", form.display_order);
        response = await fetch("/api/gallery", { method: "POST", body: data });
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save image.");

      setMessage(editing ? "Gallery image updated successfully." : "Image uploaded successfully.");
      resetForm();
      await refreshImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(image: GalleryImage) {
    const confirmed = window.confirm(`Delete "${image.title}" from the gallery? This cannot be undone.`);
    if (!confirmed) return;

    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id, storage_path: image.storage_path }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete image.");
      setMessage("Gallery image deleted.");
      await refreshImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete image.");
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
  }

  return (
    <main className="min-h-screen bg-[#061326] text-white">
      <header className="border-b border-white/10 bg-[#0b1b32]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-blue-300">COSMOVATE</p>
            <h1 className="mt-1 text-xl font-bold">Space Gallery Manager</h1>
          </div>
          <a href="/admin" className="text-sm text-blue-300 hover:text-white">← Admin dashboard</a>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[420px_1fr]">
        <section className="h-fit rounded-2xl border border-white/10 bg-[#0b1b32] p-6">
          <p className="text-xs font-bold tracking-[0.2em] text-cyan-300">
            {editing ? "EDIT IMAGE DETAILS" : "ADD TO THE COLLECTION"}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{editing ? "Edit gallery image" : "Upload an image"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            JPG, PNG, WEBP or GIF · Maximum file size 10 MB.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!editing && (
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-slate-300">Image file *</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onFileChange}
                  required
                  className="block w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-400 file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#04111d]"
                />
                {file && <span className="mt-2 block text-xs text-cyan-200">{file.name}</span>}
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-300">Image title *</span>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} required maxLength={160}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-cyan-300/50" placeholder="e.g. The Orion Nebula" />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-300">Description</span>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={4} maxLength={3000}
                className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-cyan-300/50" placeholder="Tell visitors about this image..." />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-300">Category *</span>
              <select value={form.category} onChange={(e) => updateField("category", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#10213a] px-4 py-3 text-sm outline-none focus:border-cyan-300/50">
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-300">Image credit / photographer</span>
              <input value={form.credit} onChange={(e) => updateField("credit", e.target.value)} maxLength={200}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-cyan-300/50" placeholder="e.g. NASA / ESA / Name" />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-slate-300">Display order (lower appears first)</span>
              <input type="number" value={form.display_order} onChange={(e) => updateField("display_order", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-cyan-300/50" />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => updateField("is_featured", e.target.checked)} className="h-4 w-4 accent-cyan-400" />
              Feature this image in the gallery
            </label>

            {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}
            {message && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-300">{message}</p>}

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="flex-1 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black tracking-widest text-[#04111d] transition hover:bg-cyan-200 disabled:opacity-50">
                {saving ? "SAVING..." : editing ? "SAVE CHANGES" : "UPLOAD IMAGE"}
              </button>
              {editing && <button type="button" onClick={resetForm} className="rounded-xl border border-white/15 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-white/5">Cancel</button>}
            </div>
          </form>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-cyan-300">YOUR CURATED COLLECTION</p>
              <h2 className="mt-2 text-2xl font-bold">Gallery images</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">{images.length} images</span>
          </div>

          {loading ? (
            <p className="rounded-2xl border border-white/10 p-8 text-center text-sm text-slate-400">Loading your collection...</p>
          ) : images.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
              <p className="text-4xl">🌌</p>
              <p className="mt-4 font-semibold">Your gallery is waiting for its first image.</p>
              <p className="mt-2 text-sm text-slate-500">Upload an image using the form.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
                <article key={image.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1b32]">
                  <div className="relative aspect-[4/3] bg-black/30">
                    <img src={image.image_url} alt={image.title} className="h-full w-full object-cover" />
                    {image.is_featured && <span className="absolute left-3 top-3 rounded-full bg-cyan-300 px-3 py-1 text-[9px] font-black tracking-widest text-[#04111d]">FEATURED</span>}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold tracking-widest text-cyan-300">{image.category}</p>
                    <h3 className="mt-2 font-semibold">{image.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{image.description || "No description added."}</p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => startEdit(image)} className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5">Edit details</button>
                      <button onClick={() => deleteImage(image)} className="rounded-lg border border-red-400/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-400/10">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
