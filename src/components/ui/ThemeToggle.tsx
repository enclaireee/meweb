"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const noopSubscribe = () => () => {};

/**
 * Theme switch in the annotation voice: a small disc that's an outline sun
 * in light and a filled moon-bite in dark. Flips inside a View Transitions
 * crossfade when motion is allowed; instant repaint otherwise.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes only knows the real theme on the client; render a stable
  // shell until hydrated so SSR markup matches.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";

  const flip = () => {
    const next = isDark ? "light" : "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && document.startViewTransition) {
      document.startViewTransition(() => setTheme(next));
    } else {
      setTheme(next);
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      data-cursor={isDark ? "light" : "dark"}
      className="annot fixed right-4 top-4 z-30 flex items-center gap-2 border border-border bg-background/80 px-3 py-2 text-muted backdrop-blur-sm transition-colors duration-150 hover:text-foreground sm:right-6 sm:top-6"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        {isDark ? (
          // moon: disc with a bite
          <path d="M10.5 7.3A5 5 0 1 1 4.7 1.5a4 4 0 1 0 5.8 5.8Z" fill="currentColor" />
        ) : (
          // sun: outline disc with ticks
          <>
            <circle cx="6" cy="6" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.1" />
            <g stroke="currentColor" strokeWidth="1.1">
              <line x1="6" y1="0.4" x2="6" y2="1.9" />
              <line x1="6" y1="10.1" x2="6" y2="11.6" />
              <line x1="0.4" y1="6" x2="1.9" y2="6" />
              <line x1="10.1" y1="6" x2="11.6" y2="6" />
            </g>
          </>
        )}
      </svg>
      <span className="hidden sm:inline">{mounted ? (isDark ? "dark" : "light") : "theme"}</span>
    </button>
  );
}
