"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = resolvedTheme === "dark";
  return (
    <button
      className={`label text-fg-muted transition-colors dur-fast hover:text-accent ${className}`}
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label="Toggle color theme"
    >
      {/* fixed-width slot so the label doesn't reflow on hydration */}
      <span suppressHydrationWarning>
        MODE/{mounted ? (dark ? "DARK" : "LIGHT") : "····"}
      </span>
    </button>
  );
}
