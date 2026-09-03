"use client";

import { useSyncExternalStore } from "react";
import { FaMoon, FaSun } from "react-icons/fa6";

/**
 * Dark is canonical; this only records a deviation from it. The resolved
 * theme is stamped on <html> before first paint by the inline script in
 * layout.tsx, so this control's job is to read what is already there.
 *
 * <html> is the store. Reading it through useSyncExternalStore rather than
 * an effect keeps the server snapshot honest — the server cannot know which
 * theme the visitor resolved to, so it renders the canonical one and the
 * client corrects on its first paint with no hydration mismatch. Same
 * pattern the viewport query uses.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const readTheme = () =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as const);
  const next = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("theme", next);
        } catch {
          // Private mode can refuse storage. The theme still applies to this
          // page view; it just will not be remembered.
        }
      }}
      aria-label={`Switch to ${next} theme`}
      className="text-small text-muted transition-colors duration-(--dur-micro) hover:text-ink"
    >
      {theme === "light" ? <FaMoon aria-hidden /> : <FaSun aria-hidden />}
    </button>
  );
}
