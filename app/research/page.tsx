"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Article = {
  slug: string;
  number: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  featured?: boolean;
};

const articles: Article[] = [
  {
    slug: "exoplanets-how-we-find-worlds",
    number: "001",
    category: "Exoplanets",
    title: "How do we find worlds around distant stars?",
    excerpt:
      "Explore the transit and radial-velocity methods that help astronomers detect planets orbiting stars beyond our Solar System.",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "black-holes-how-we-detect-the-invisible",
    number: "002",
    category: "Astrophysics",
    title: "Black holes: how do we detect the invisible?",
    excerpt:
      "Black holes do not shine like stars. Learn how their influence on nearby matter, stars and light reveals their presence.",
    readTime: "5 min read",
  },
];

const categories = ["All", "Exoplanets", "Astrophysics"];

export default function ResearchLibraryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredArticles = useMemo(() => {
    const term = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "All" || article.category === activeCategory;
      const matchesSearch =
        !term ||
        `${article.title} ${article.excerpt} ${article.category}`
          .toLowerCase()
          .includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <main className="research-page">
      <div className="research-page-stars" aria-hidden="true" />
      <div className="container research-page-content">
        <Link href="/#research" className="research-back-link">
          ← BACK TO COSMOVATE
        </Link>

        <span className="section-label">COSMOVATE / RESEARCH & PUBLICATIONS</span>
        <h1>
          The cosmic <span>notebook.</span>
        </h1>
        <p className="research-page-intro">
          Science explainers, carefully researched perspectives and reading
          notes that make the universe a little easier to understand.
        </p>

        <div className="research-library-toolbar">
          <label className="research-search">
            <span className="sr-only">Search publications</span>
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search topics, discoveries..."
            />
          </label>
          <div className="research-filters" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`research-filter ${activeCategory === category ? "is-active" : ""}`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="research-results-line">
          <span>THE LIBRARY</span>
          <span>{filteredArticles.length.toString().padStart(2, "0")} EXPLAINERS</span>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="research-article-grid">
            {filteredArticles.map((article) => (
              <article className="research-article-card" key={article.slug}>
                <Link href={`/research/${article.slug}`} className="research-card-link">
                  <div className={`research-card-art research-card-art-${article.number}`}>
                    <span className="research-card-art-orb" />
                    <span className="research-card-art-ring" />
                    <span className="research-card-number">{article.number}</span>
                  </div>
                  <div className="research-card-content">
                    <div className="research-card-meta">
                      <span>{article.category}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h2>{article.title}</h2>
                    <p>{article.excerpt}</p>
                    <span className="research-read-link">
                      READ EXPLAINER <span>↗</span>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="research-empty">
            <span>✧</span>
            <h2>No matching explainers.</h2>
            <p>Try another search term or choose a different topic.</p>
            <button
              type="button"
              className="research-reset"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        <p className="research-editorial-note">
          COSMOVATE explainers are educational summaries, not peer-reviewed
          papers or original research. Each article links to its scientific
          reference material.
        </p>
      </div>
    </main>
  );
}
