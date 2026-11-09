"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageTransition() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [active, setActive] = useState(false);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      previousPath.current = pathname;
      setActive(false);
      return;
    }

    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (document.documentElement.classList.contains("cosmovate-lite-mode")) {
      setActive(false);
      return;
    }

    setActive(true);
    const timeout = window.setTimeout(() => setActive(false), 620);

    return () => window.clearTimeout(timeout);
  }, [pathname, isAdmin]);

  if (isAdmin) return null;

  return (
    <div
      className={`cosmo-page-transition${active ? " is-active" : ""}`}
      aria-hidden="true"
    >
      <div className="cosmo-transition-stars" />
      <div className="cosmo-transition-orbit cosmo-transition-orbit-a" />
      <div className="cosmo-transition-orbit cosmo-transition-orbit-b" />
      <div className="cosmo-transition-planet" />
      <span className="cosmo-transition-wordmark">COSMOVATE</span>
      <span className="cosmo-transition-caption">
        TRAVELLING THROUGH THE COSMOS
      </span>

      <style jsx global>{`
        .cosmo-page-transition {
          position: fixed;
          z-index: 9998;
          inset: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          background: radial-gradient(
            ellipse at 50% 48%,
            #102d53 0%,
            #07172d 42%,
            #030914 100%
          );
          clip-path: circle(0% at 50% 50%);
          transition: clip-path 620ms cubic-bezier(.76,0,.24,1),
            opacity 180ms ease, visibility 0s linear 620ms;
        }

        .cosmo-page-transition.is-active {
          opacity: 1;
          visibility: visible;
          clip-path: circle(150% at 50% 50%);
          transition: clip-path 620ms cubic-bezier(.76,0,.24,1),
            opacity 100ms ease, visibility 0s;
        }

        .cosmo-transition-stars {
          position: absolute;
          inset: -20%;
          opacity: .75;
          background-image:
            radial-gradient(1px 1px at 12% 18%, #fff 99%, transparent),
            radial-gradient(2px 2px at 76% 32%, #b9d9ff 99%, transparent),
            radial-gradient(1px 1px at 48% 78%, #fff 99%, transparent),
            radial-gradient(1px 1px at 88% 82%, #fff 99%, transparent);
          background-size: 180px 170px, 260px 220px, 210px 190px, 300px 260px;
          animation: cosmoTransitionStarDrift 8s linear infinite;
        }

        .cosmo-transition-planet {
          position: absolute;
          width: clamp(82px, 12vw, 138px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(
            circle at 30% 25%,
            #e3f1ff 0%,
            #8eb9e8 18%,
            #315d91 48%,
            #07172c 78%
          );
          box-shadow: inset -22px -16px 30px rgba(0,0,0,.72),
            0 0 65px rgba(105,169,245,.42),
            0 0 150px rgba(64,123,206,.2);
          animation: cosmoTransitionPlanet 620ms cubic-bezier(.16,1,.3,1) both;
        }

        .cosmo-transition-orbit {
          position: absolute;
          width: clamp(220px, 34vw, 390px);
          height: clamp(75px, 12vw, 130px);
          border: 1px solid rgba(174,211,255,.42);
          border-radius: 50%;
          box-shadow: 0 0 18px rgba(103,166,244,.12);
        }

        .cosmo-transition-orbit-a {
          transform: rotate(-24deg);
          animation: cosmoTransitionOrbit 620ms ease both;
        }

        .cosmo-transition-orbit-b {
          width: clamp(270px, 42vw, 470px);
          transform: rotate(35deg);
          opacity: .45;
          animation: cosmoTransitionOrbit 720ms ease both;
        }

        .cosmo-transition-wordmark,
        .cosmo-transition-caption {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          white-space: nowrap;
        }

        .cosmo-transition-wordmark {
          top: calc(50% + clamp(100px, 14vw, 155px));
          color: #edf5ff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .42em;
        }

        .cosmo-transition-caption {
          top: calc(50% + clamp(124px, 17vw, 180px));
          color: #8eacd3;
          font-size: 8px;
          letter-spacing: .24em;
        }

        .cosmo-page-transition.is-active .cosmo-transition-wordmark {
          animation: cosmoTransitionText 500ms 100ms both;
        }

        .cosmo-page-transition.is-active .cosmo-transition-caption {
          animation: cosmoTransitionText 500ms 180ms both;
        }

        @keyframes cosmoTransitionPlanet {
          from {
            opacity: 0;
            transform: scale(.45) rotate(-35deg);
            filter: blur(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0);
            filter: blur(0);
          }
        }

        @keyframes cosmoTransitionOrbit {
          from { opacity: 0; scale: .6; }
          to { opacity: 1; scale: 1; }
        }

        @keyframes cosmoTransitionText {
          from {
            opacity: 0;
            translate: 0 12px;
            filter: blur(6px);
          }
          to {
            opacity: 1;
            translate: 0 0;
            filter: blur(0);
          }
        }

        @keyframes cosmoTransitionStarDrift {
          to { transform: translate3d(4%, -3%, 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .cosmo-page-transition,
          .cosmo-page-transition * {
            animation: none !important;
            transition-duration: .01ms !important;
          }
        }

        html.cosmovate-lite-mode .cosmo-page-transition {
          display: none !important;
        }
      `}</style>
    </div>
  );
}