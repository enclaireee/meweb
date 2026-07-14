"use client";

import { useTheme } from "next-themes";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      className={`label text-fg-muted transition-colors dur-fast hover:text-accent ${className}`}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
    >
      {/* label resolved by CSS from the html theme class — no mounted guard */}
      <span className="light:hidden">MODE/DARK</span>
      <span className="hidden light:inline">MODE/LIGHT</span>
    </button>
  );
}
