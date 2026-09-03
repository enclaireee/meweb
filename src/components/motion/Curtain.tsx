"use client";

import { useEffect, useRef } from "react";
import { motion as m } from "@content/meta/motion";

const SEEN_KEY = "curtain-seen";

/**
 * The curtain. Spec v4 §2.
 *
 * Not a loading screen — an opaque plane over a page that is already painted.
 * The measured difference, from the Phase 1 research: sokolovski.pro has 22,321
 * words rendered behind its curtain at 400ms; cipher.tv has 76. Everything
 * below is in service of being the first kind.
 *
 * - `aria-hidden` and `inert`, so it is invisible to assistive tech and
 *   unfocusable. A crawler never sees it at all.
 * - Exits on min(fonts.ready, cap). No counter, no fake progress.
 * - First visit per session. Never on back-navigation, never on expand-close.
 * - Any input dismisses it immediately.
 * - Never rendered under reduced motion or on a low-power device — that is
 *   what the absence of data-motion means.
 *
 * It is rendered by the client after mount rather than server-side, which is
 * deliberate: server-rendering it would put an opaque div in the HTML that a
 * JS-disabled visitor could never remove.
 */
export function Curtain() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-motion")) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      // Private mode refuses storage; treat it as "already seen" so a visitor
      // who cannot be remembered is never shown this twice in a row either.
      seen = true;
    }
    if (seen) return;

    const el = ref.current;
    if (!el) return;
    el.dataset.on = "";
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}

    let lifted = false;
    const lift = () => {
      if (lifted) return;
      lifted = true;
      el.dataset.lift = "";
      // The greeting is already rising underneath by now — the two overlap by
      // design, so this reads as one gesture rather than a handoff.
      window.setTimeout(() => el.remove(), m.curtainLiftMs + 100);
      for (const ev of DISMISS) window.removeEventListener(ev, lift);
    };

    const DISMISS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    for (const ev of DISMISS) {
      window.addEventListener(ev, lift, { once: true, passive: true });
    }

    // Real signal, then the ceiling. Whichever comes first.
    const cap = window.setTimeout(lift, m.curtainCapMs);
    document.fonts.ready.then(lift).catch(lift);

    return () => {
      window.clearTimeout(cap);
      for (const ev of DISMISS) window.removeEventListener(ev, lift);
    };
  }, []);

  return <div ref={ref} aria-hidden inert className="curtain" />;
}
