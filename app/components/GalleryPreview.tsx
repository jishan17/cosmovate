"use client";

import { useEffect, useState } from "react";

type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  credit: string | null;
  image_url: string;
  is_featured: boolean;
};

export default function GalleryPreview() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/gallery")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load gallery");
        return response.json();
      })
      .then((data: { images?: GalleryImage[] }) => {
        if (active) setImages((data.images ?? []).slice(0, 3));
      })
      .catch(() => {
        if (active) setImages([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#050D1B] py-20 md:py-28">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-cyan-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[110px]" />

      <div className="container relative z-10">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="section-label">08 / THE COSMIC GALLERY</span>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
              A window into
              <br />
              <span className="text-cyan-300">the universe.</span>
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-300">
            Explore remarkable space images curated and uploaded by the COSMOVATE team.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center text-slate-400">
            Loading the cosmic gallery…
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {images.map((image) => (
              <a
                key={image.id}
                href="/gallery"
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] no-underline transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  {/* Supabase Storage image URL */}
                  <img
                    src={image.image_url}
                    alt={image.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {image.is_featured && (
                    <span className="absolute left-4 top-4 rounded-full border border-cyan-200/30 bg-slate-950/80 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-cyan-200">
                      FEATURED
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    {image.category}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold text-white">{image.title}</h3>
                  {image.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                      {image.description}
                    </p>
                  )}
                  {image.credit && (
                    <p className="mt-3 text-xs text-slate-500">Image credit: {image.credit}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center">
            <p className="text-slate-300">New discoveries are on their way.</p>
            <p className="mt-2 text-sm text-slate-500">Visit the gallery to explore the collection.</p>
          </div>
        )}

        <div className="mt-9 flex justify-center">
          <a
            href="/gallery"
            className="inline-flex items-center gap-3 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-7 py-3 text-sm font-bold text-cyan-100 no-underline transition hover:bg-cyan-300/20"
          >
            Explore the Full Gallery <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
