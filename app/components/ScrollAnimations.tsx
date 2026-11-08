"use client";

import { useEffect } from "react";

export default function ScrollAnimations() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-reveal]")
    );
    const staggerGroups = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-stagger]")
    );
    const staggerItems = staggerGroups.flatMap((group) =>
      Array.from(group.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement
      )
    );
    const allItems = Array.from(new Set([...revealItems, ...staggerItems]));

    // Always fail open: if motion is disabled or IntersectionObserver is unavailable,
    // content remains visible instead of leaving the page blank.
    const showEverything = () => {
      allItems.forEach((item) => item.classList.add("scroll-is-visible"));
      root.classList.remove("cosmo-motion-ready");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      showEverything();
      return;
    }

    staggerGroups.forEach((group) => {
      Array.from(group.children).forEach((child, index) => {
        if (!(child instanceof HTMLElement)) return;
        child.style.setProperty("--scroll-stagger", `${index * 150}ms`);
        child.classList.add("scroll-stagger-item");
      });
    });

    // Make the reveal CSS active only after the observer is ready.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("scroll-is-visible");
          // Reveal once. Scrolling back up will never make content disappear.
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );

    allItems.forEach((item) => observer.observe(item));
    root.classList.add("cosmo-motion-ready");

    const progress = document.querySelector<HTMLElement>(".cosmo-scroll-progress");
    let ticking = false;

    const updateProgress = () => {
      if (progress) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
        progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    return () => {
      observer.disconnect();
      root.classList.remove("cosmo-motion-ready");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <>
      <div className="cosmo-scroll-progress" aria-hidden="true" />
      <style jsx global>{`
        .cosmo-scroll-progress {
          position: fixed;
          z-index: 1000;
          inset: 0 auto auto 0;
          width: 100%;
          height: 3px;
          pointer-events: none;
          transform: scaleX(0);
          transform-origin: left center;
          background: linear-gradient(90deg, #477bdb, #a9d5ff, #ffffff);
          box-shadow: 0 0 14px rgba(110, 170, 255, 0.8);
          will-change: transform;
        }

        /* Default state is visible. Only hide elements after JS has safely
           installed the observer, preventing a blank page on load/errors. */
        .cosmo-motion-ready [data-scroll-reveal],
        .cosmo-motion-ready .scroll-stagger-item {
          opacity: 0;
          visibility: hidden;
          filter: blur(14px);
          transform: translate3d(0, 58px, 0) scale(0.92);
          transition:
            opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 1050ms cubic-bezier(0.16, 1, 0.3, 1),
            filter 950ms cubic-bezier(0.16, 1, 0.3, 1),
            visibility 0s linear 950ms;
          transition-delay: 0ms;
          will-change: opacity, transform, filter;
        }

        .cosmo-motion-ready [data-scroll-reveal="hero"] {
          transform: translate3d(-54px, 28px, 0) scale(0.96);
        }

        .cosmo-motion-ready [data-scroll-reveal="cosmos"],
        .cosmo-motion-ready [data-scroll-reveal="zoom"] {
          transform: translate3d(0, 42px, 0) scale(0.82);
        }

        .cosmo-motion-ready .scroll-stagger-item {
          transition-delay: var(--scroll-stagger, 0ms);
        }

        .cosmo-motion-ready [data-scroll-reveal].scroll-is-visible,
        .cosmo-motion-ready .scroll-stagger-item.scroll-is-visible {
          opacity: 1;
          visibility: visible;
          filter: blur(0);
          transform: translate3d(0, 0, 0) scale(1);
          transition-delay: 0ms;
        }

        .hero-copy.scroll-is-visible > .eyebrow {
          animation: cosmoTextIn 800ms both;
        }

        .hero-copy.scroll-is-visible h1 {
          animation: cosmoTextIn 1000ms 100ms both;
        }

        .hero-copy.scroll-is-visible .hero-description {
          animation: cosmoTextIn 950ms 220ms both;
        }

        .hero-copy.scroll-is-visible .hero-actions {
          animation: cosmoTextIn 950ms 340ms both;
        }

        .cosmos-art.scroll-is-visible {
          animation: cosmoCosmosIn 1500ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .domain-card,
        .leader-card,
        .research-feature,
        .mission-values > div {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }

        .domain-card,
        .leader-card {
          transition:
            transform 550ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 400ms ease,
            box-shadow 550ms ease;
        }

        .domain-card:hover,
        .leader-card:hover {
          transform: translateY(-12px) scale(1.025);
          box-shadow: 0 24px 65px rgba(32, 91, 170, 0.28);
        }

        .research-feature-art::after {
          content: "";
          position: absolute;
          inset: -40%;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 38%,
            rgba(190, 220, 255, 0.16) 50%,
            transparent 62%
          );
          transform: translateX(-70%) rotate(12deg);
          transition: transform 1.2s ease;
        }

        .research-feature:hover .research-feature-art::after {
          transform: translateX(70%) rotate(12deg);
        }

        @keyframes cosmoTextIn {
          from {
            opacity: 0;
            transform: translateY(26px);
            filter: blur(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes cosmoCosmosIn {
          from {
            opacity: 0;
            transform: translate3d(42px, 26px, 0) scale(0.84);
            filter: blur(14px);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cosmo-motion-ready [data-scroll-reveal],
          .cosmo-motion-ready .scroll-stagger-item,
          [data-scroll-reveal],
          .scroll-stagger-item {
            opacity: 1 !important;
            visibility: visible !important;
            filter: none !important;
            transform: none !important;
            transition: none !important;
            animation: none !important;
          }
          .cosmo-scroll-progress {
            display: none;
          }
        }

        @media (max-width: 700px) {
          .cosmo-motion-ready [data-scroll-reveal],
          .cosmo-motion-ready .scroll-stagger-item {
            transform: translate3d(0, 34px, 0) scale(0.96);
            transition-duration: 750ms;
          }
        }
      `}</style>
    </>
  );
}
