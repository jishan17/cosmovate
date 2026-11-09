"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "cosmovate_lite_mode";
const MODE_EVENT = "cosmovate:lite-mode-change";

export default function LiteModeToggle() {
  const pathname = usePathname();
  const [liteMode, setLiteMode] = useState(false);
  const [ready, setReady] = useState(false);

  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      document.documentElement.classList.remove("cosmovate-lite-mode");
      document.documentElement.dataset.liteMode = "false";
      setReady(true);
      return;
    }

    try {
      const savedMode = window.localStorage.getItem(STORAGE_KEY) === "true";
      setLiteMode(savedMode);
      document.documentElement.classList.toggle("cosmovate-lite-mode", savedMode);
      document.documentElement.dataset.liteMode = String(savedMode);
    } catch {
      // Storage unavailable.
    }

    setReady(true);
  }, [isAdmin]);

  if (isAdmin) return null;

  function toggleLiteMode() {
    const nextMode = !liteMode;

    setLiteMode(nextMode);
    document.documentElement.classList.toggle("cosmovate-lite-mode", nextMode);
    document.documentElement.dataset.liteMode = String(nextMode);

    try {
      window.localStorage.setItem(STORAGE_KEY, String(nextMode));
    } catch {
      // Keep the current session working.
    }

    window.dispatchEvent(new Event(MODE_EVENT));
  }

  return (
    <button
      type="button"
      className={`cosmo-lite-toggle${liteMode ? " is-enabled" : ""}`}
      onClick={toggleLiteMode}
      aria-pressed={liteMode}
      aria-label={liteMode ? "Turn off Lite Mode" : "Turn on Lite Mode"}
      title={liteMode ? "Switch to Standard Mode" : "Enable Lite Mode"}
      data-ready={ready}
      style={{
        position: "absolute",
        top: "20px",
        right: "24px",
        bottom: "auto",
        left: "auto",
        zIndex: 10000,
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M13.2 2.8 5.8 13h5.1l-.7 8.2L18.2 10h-5.1l.1-7.2Z" />
      </svg>

      <span>{liteMode ? "Lite Mode ON" : "Lite Mode"}</span>
      <span className="cosmo-lite-status" aria-hidden="true" />
    </button>
  );
}