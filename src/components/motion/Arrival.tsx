"use client";

import { useEffect } from "react";

/**
 * Starts the opening sequence. Spec v4 §2–3.
 *
 * The greeting waits on `document.fonts.ready` for a reason §5 spells out:
 * animating a fallback face and swapping to Archivo mid-motion is worse than
 * waiting. Fonts are also what the curtain waits on, so the two share one gate.
 *
 * Nothing here gates content. The greeting is painted at full opacity from
 * first paint; `data-motion` is what puts it in its hidden start state, and
 * this only releases it.
 */
export function Arrival() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-motion")) return;

    let done = false;
    const play = () => {
      if (done) return;
      done = true;

      // The width axis changes glyph advances, which is a LAYOUT change, not a
      // transform — measured at CLS 0.002 without this. Freezing each mask at
      // its settled width means a character can widen inside its own box
      // without ever moving the ones after it. One forced layout, once, while
      // the curtain is still up.
      for (const mask of document.querySelectorAll<HTMLElement>(".split-mask")) {
        mask.style.width = `${mask.getBoundingClientRect().width.toFixed(2)}px`;
      }

      root.setAttribute("data-play", "");
    };

    // Whichever comes first. The cap is a ceiling, not a duration: a visitor on
    // a slow connection never waits longer than this for their own name.
    const cap = setTimeout(play, 1200);
    document.fonts.ready.then(play).catch(play);

    return () => clearTimeout(cap);
  }, []);

  return null;
}
