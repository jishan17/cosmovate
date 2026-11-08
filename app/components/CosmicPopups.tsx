"use client";

import { useEffect, useState } from "react";

const destinations = [
  { label: "Astronomy", href: "/explore/astronomy" },
  { label: "Astrophysics", href: "/explore/astrophysics" },
  { label: "Space Exploration", href: "/explore/space-exploration" },
  { label: "Cosmic Research", href: "/explore/cosmic-research" },
];

export default function CosmicPopups() {
  const [toastOpen, setToastOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setToastOpen(true), 6500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen]);

  return (
    <>
      <div className="cosmo-popup-launcher-wrap">
        {toastOpen && !modalOpen && (
          <aside className="cosmo-signal-toast" role="status">
            <button
              className="cosmo-toast-close"
              type="button"
              aria-label="Dismiss message"
              onClick={() => setToastOpen(false)}
            >
              ×
            </button>
            <span className="cosmo-popup-kicker"><i /> INCOMING COSMIC SIGNAL</span>
            <strong>Your next discovery starts here.</strong>
            <span>Explore the universe with COSMOVATE.</span>
            <button className="cosmo-toast-link" type="button" onClick={() => { setToastOpen(false); setModalOpen(true); }}>
              OPEN TRANSMISSION <span>↗</span>
            </button>
          </aside>
        )}
        <button
          className="cosmo-popup-launcher"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          onClick={() => { setToastOpen(false); setModalOpen(true); }}
        >
          <span className="cosmo-launcher-orbit" aria-hidden="true">✦</span>
          <span className="cosmo-launcher-copy"><small>COSMIC</small><strong>SIGNAL</strong></span>
          <span className="cosmo-launcher-arrow" aria-hidden="true">↗</span>
        </button>
      </div>

      {modalOpen && (
        <div className="cosmo-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="cosmo-modal" role="dialog" aria-modal="true" aria-labelledby="cosmo-modal-title">
            <button className="cosmo-modal-close" type="button" aria-label="Close dialog" onClick={() => setModalOpen(false)}>×</button>
            <div className="cosmo-modal-visual" aria-hidden="true">
              <span className="cosmo-modal-orbit cosmo-modal-orbit-one" />
              <span className="cosmo-modal-orbit cosmo-modal-orbit-two" />
              <span className="cosmo-modal-planet" />
              <span className="cosmo-modal-spark cosmo-modal-spark-one">✦</span>
              <span className="cosmo-modal-spark cosmo-modal-spark-two">✧</span>
            </div>
            <span className="cosmo-popup-kicker"><i /> TRANSMISSION RECEIVED · 001</span>
            <h2 id="cosmo-modal-title">The universe is <em>calling.</em></h2>
            <p>Choose a frontier, follow your curiosity and discover what lies beyond the familiar.</p>
            <div className="cosmo-modal-links">
              {destinations.map((destination, index) => (
                <a href={destination.href} key={destination.href}>
                  <span>0{index + 1}</span>{destination.label}<b>↗</b>
                </a>
              ))}
            </div>
            <a className="cosmo-modal-join" href="/apply">JOIN THE COSMOVATE COMMUNITY <span>↗</span></a>
            <span className="cosmo-modal-footnote">EXPLORE · INNOVATE · DISCOVER</span>
          </section>
        </div>
      )}

      <style jsx global>{`
        .cosmo-popup-launcher-wrap { position: fixed; z-index: 1200; right: 26px; bottom: 25px; display: flex; flex-direction: column; align-items: flex-end; gap: 14px; font-family: inherit; }
        .cosmo-popup-launcher { position: relative; display: flex; align-items: center; gap: 11px; min-width: 164px; padding: 11px 14px; color: #edf5ff; border: 1px solid rgba(153,195,255,.38); border-radius: 16px; background: linear-gradient(135deg, rgba(14,35,65,.96), rgba(5,16,33,.97)); box-shadow: 0 12px 42px rgba(0,0,0,.34), 0 0 24px rgba(71,123,219,.17); cursor: pointer; backdrop-filter: blur(18px); transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease; }
        .cosmo-popup-launcher:hover { transform: translateY(-5px) scale(1.035); border-color: rgba(177,215,255,.85); box-shadow: 0 18px 50px rgba(0,0,0,.42), 0 0 30px rgba(71,123,219,.3); }
        .cosmo-launcher-orbit { display: grid; place-items: center; width: 35px; height: 35px; border: 1px solid rgba(164,205,255,.55); border-radius: 50%; color: #b9dcff; box-shadow: inset 0 0 15px rgba(83,145,232,.24), 0 0 17px rgba(83,145,232,.2); animation: cosmoLauncherPulse 3s ease-in-out infinite; }
        .cosmo-launcher-copy { display: grid; gap: 1px; text-align: left; letter-spacing: .16em; line-height: 1.1; }
        .cosmo-launcher-copy small { color: #8eafd9; font-size: 8px; }
        .cosmo-launcher-copy strong { font-size: 11px; }
        .cosmo-launcher-arrow { margin-left: auto; color: #a9d5ff; }
        .cosmo-signal-toast { position: relative; display: grid; gap: 7px; width: min(320px, calc(100vw - 36px)); padding: 20px 20px 17px; color: #eaf3ff; border: 1px solid rgba(137,183,245,.36); border-radius: 16px; background: radial-gradient(circle at 100% 0, rgba(62,112,184,.28), transparent 45%), rgba(5,17,35,.96); box-shadow: 0 20px 65px rgba(0,0,0,.42), 0 0 30px rgba(71,123,219,.13); backdrop-filter: blur(20px); animation: cosmoToastIn .7s cubic-bezier(.16,1,.3,1) both; }
        .cosmo-toast-close, .cosmo-modal-close { position: absolute; top: 9px; right: 12px; border: 0; background: transparent; color: #b7c9e2; font-size: 25px; line-height: 1; cursor: pointer; }
        .cosmo-popup-kicker { display: flex; align-items: center; gap: 8px; color: #9fc8ff; font-size: 9px; font-weight: 700; letter-spacing: .18em; }
        .cosmo-popup-kicker i { width: 6px; height: 6px; border-radius: 50%; background: #80c7ff; box-shadow: 0 0 12px #80c7ff; animation: cosmoSignalBlink 1.6s ease-in-out infinite; }
        .cosmo-signal-toast > strong { padding-right: 12px; font-size: 17px; letter-spacing: -.02em; }
        .cosmo-signal-toast > span:not(.cosmo-popup-kicker) { color: #a8b9d1; font-size: 12px; }
        .cosmo-toast-link { justify-self: start; margin-top: 5px; padding: 0; border: 0; background: none; color: #b8d9ff; font-size: 10px; font-weight: 800; letter-spacing: .13em; cursor: pointer; }
        .cosmo-toast-link span { margin-left: 7px; }
        .cosmo-modal-backdrop { position: fixed; z-index: 1300; inset: 0; display: grid; place-items: center; overflow-y: auto; padding: 24px; background: rgba(1,7,17,.76); backdrop-filter: blur(13px); animation: cosmoBackdropIn .28s ease both; }
        .cosmo-modal { position: relative; width: min(560px, 100%); max-height: min(820px, calc(100vh - 48px)); overflow-y: auto; padding: 34px clamp(22px, 5vw, 46px) 27px; color: #edf5ff; border: 1px solid rgba(151,194,255,.32); border-radius: 22px; background: radial-gradient(ellipse at 50% 0, rgba(57,105,175,.28), transparent 48%), linear-gradient(155deg, #0b1d37, #050e1e 75%); box-shadow: 0 35px 110px rgba(0,0,0,.58), 0 0 55px rgba(71,123,219,.18); animation: cosmoModalPop .65s cubic-bezier(.16,1,.3,1) both; }
        .cosmo-modal-close { z-index: 2; top: 17px; right: 19px; width: 34px; height: 34px; border: 1px solid rgba(165,198,239,.2); border-radius: 50%; font-size: 23px; transition: transform .25s ease, background .25s ease; }
        .cosmo-modal-close:hover { transform: rotate(90deg); background: rgba(120,170,235,.15); }
        .cosmo-modal-visual { position: relative; height: 145px; margin: -10px 0 18px; overflow: hidden; }
        .cosmo-modal-planet { position: absolute; top: 35px; left: 50%; width: 78px; height: 78px; border-radius: 50%; transform: translateX(-50%); isolation: isolate; background: radial-gradient(circle at 32% 27%, #d9edff 0%, #8db9e8 17%, #5c8ec9 36%, #19345d 72%, #081326 100%); box-shadow: inset -13px -9px 20px rgba(0,0,0,.55), inset 7px 5px 15px rgba(220,240,255,.2), 0 0 28px rgba(95,157,235,.35), 0 0 58px rgba(75,143,235,.2); animation: cosmoPlanetFloat 5s ease-in-out infinite, cosmoPlanetAura 4s ease-in-out infinite; }
        .cosmo-modal-planet::before { content: ""; position: absolute; inset: 2px; border-radius: inherit; background: repeating-linear-gradient(112deg, transparent 0 9px, rgba(194,224,255,.12) 10px 12px, transparent 14px 21px), conic-gradient(from 0deg, transparent, rgba(184,220,255,.25), transparent 42%, rgba(9,29,61,.35), transparent 78%); opacity: .72; mix-blend-mode: screen; animation: cosmoPlanetSurface 18s linear infinite; }
        .cosmo-modal-planet::after { content: ""; position: absolute; inset: -8px; border: 1px solid rgba(157,207,255,.34); border-left-color: rgba(157,207,255,.06); border-bottom-color: rgba(157,207,255,.12); border-radius: 50%; box-shadow: 0 0 18px rgba(100,170,255,.18), inset 0 0 12px rgba(100,170,255,.08); animation: cosmoPlanetHalo 3.8s ease-in-out infinite; }
        .cosmo-modal-orbit { position: absolute; top: 22px; left: 50%; width: 210px; height: 100px; border: 1px solid rgba(156,199,255,.35); border-radius: 50%; transform: translateX(-50%) rotate(-19deg); }
        .cosmo-modal-orbit-two { width: 270px; height: 126px; transform: translateX(-50%) rotate(24deg); border-color: rgba(120,166,228,.2); }
        .cosmo-modal-orbit::after { content: ""; position: absolute; top: 50%; left: 0; width: 6px; height: 6px; margin: -3px; border-radius: 50%; background: #d9efff; box-shadow: 0 0 8px 2px rgba(132,194,255,.75), 0 0 18px rgba(132,194,255,.55); offset-path: ellipse(50% 50% at 50% 50%); offset-distance: 0%; animation: cosmoOrbitParticle 9s linear infinite; }
        .cosmo-modal-orbit-two::after { width: 4px; height: 4px; background: #8fc5ff; animation-duration: 13s; animation-delay: -5s; }
        .cosmo-modal-spark { position: absolute; color: #c8e4ff; text-shadow: 0 0 15px #8ec5ff; animation: cosmoSparkle 2.4s ease-in-out infinite; }
        .cosmo-modal-spark-one { top: 20px; left: 27%; }
        .cosmo-modal-spark-two { right: 25%; bottom: 17px; animation-delay: .8s; }
        .cosmo-modal h2 { margin: 13px 0 9px; font-size: clamp(30px, 6vw, 43px); line-height: 1.08; letter-spacing: -.045em; }
        .cosmo-modal h2 em { color: #a9d5ff; font-style: normal; }
        .cosmo-modal > p { max-width: 420px; margin: 0 0 23px; color: #aebed4; font-size: 14px; line-height: 1.7; }
        .cosmo-modal-links { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
        .cosmo-modal-links a { display: flex; align-items: center; gap: 9px; min-height: 49px; padding: 11px 12px; color: #e6f1ff; text-decoration: none; border: 1px solid rgba(143,183,237,.19); border-radius: 10px; background: rgba(105,151,214,.06); font-size: 12px; transition: transform .25s ease, background .25s ease, border-color .25s ease; }
        .cosmo-modal-links a:hover { transform: translateY(-3px); border-color: rgba(160,204,255,.58); background: rgba(105,151,214,.14); }
        .cosmo-modal-links a span { color: #7fa9dc; font-size: 9px; letter-spacing: .1em; }
        .cosmo-modal-links a b { margin-left: auto; color: #a9d5ff; font-weight: 500; }
        .cosmo-modal-join { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; padding: 15px 17px; color: #071326; text-decoration: none; border-radius: 10px; background: linear-gradient(100deg, #b9dcff, #6f9edb); font-size: 10px; font-weight: 900; letter-spacing: .12em; transition: transform .25s ease, box-shadow .25s ease; }
        .cosmo-modal-join:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(102,159,229,.3); }
        .cosmo-modal-footnote { display: block; margin-top: 18px; color: #7189a9; text-align: center; font-size: 8px; letter-spacing: .24em; }
        @keyframes cosmoToastIn { from { opacity: 0; transform: translate3d(0,22px,0) scale(.92); filter: blur(12px); } 70% { opacity: 1; transform: translate3d(0,-3px,0) scale(1.015); filter: blur(0); } to { transform: translate3d(0,0,0) scale(1); } }
        @keyframes cosmoBackdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cosmoModalPop { from { opacity: 0; transform: translateY(35px) scale(.86); filter: blur(14px); } 70% { opacity: 1; transform: translateY(-5px) scale(1.015); filter: blur(0); } to { transform: translateY(0) scale(1); } }
        @keyframes cosmoLauncherPulse { 0%,100% { box-shadow: inset 0 0 15px rgba(83,145,232,.24), 0 0 10px rgba(83,145,232,.12); } 50% { box-shadow: inset 0 0 18px rgba(83,145,232,.4), 0 0 22px rgba(83,145,232,.35); } }
        @keyframes cosmoSignalBlink { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        @keyframes cosmoPlanetFloat { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-8px); } }
        @keyframes cosmoPlanetSurface { from { transform: rotate(0deg) scale(1.02); } to { transform: rotate(360deg) scale(1.02); } }
        @keyframes cosmoPlanetAura { 0%,100% { box-shadow: inset -13px -9px 20px rgba(0,0,0,.55), inset 7px 5px 15px rgba(220,240,255,.2), 0 0 28px rgba(95,157,235,.35), 0 0 58px rgba(75,143,235,.2); } 50% { box-shadow: inset -13px -9px 20px rgba(0,0,0,.5), inset 7px 5px 18px rgba(220,240,255,.28), 0 0 38px rgba(95,157,235,.55), 0 0 76px rgba(75,143,235,.32); } }
        @keyframes cosmoPlanetHalo { 0%,100% { transform: scale(.96); opacity: .55; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes cosmoOrbitParticle { from { offset-distance: 0%; } to { offset-distance: 100%; } }
        @keyframes cosmoSparkle { 0%,100% { opacity: .45; transform: scale(.8) rotate(0); } 50% { opacity: 1; transform: scale(1.25) rotate(18deg); } }
        @media (max-width: 520px) { .cosmo-popup-launcher-wrap { right: 14px; bottom: 14px; } .cosmo-modal-links { grid-template-columns: 1fr; } .cosmo-modal { padding-top: 28px; } }
        @media (prefers-reduced-motion: reduce) { .cosmo-popup-launcher, .cosmo-launcher-orbit, .cosmo-signal-toast, .cosmo-modal-backdrop, .cosmo-modal, .cosmo-modal-planet, .cosmo-modal-planet::before, .cosmo-modal-planet::after, .cosmo-modal-orbit::after, .cosmo-modal-spark, .cosmo-popup-kicker i { animation: none !important; transition: none !important; } }
      `}</style>
    </>
  );
}
