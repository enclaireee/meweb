"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const items = [
  { href: "/", tag: "IDX" },
  { href: "/work", tag: "WORK" },
  { href: "/about", tag: "ABOUT" },
];

/** The console header: opaque instrument bar, no glass. */
export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <nav className="mx-auto flex max-w-console items-center justify-between gap-s3 px-gutter py-s2">
        <Link href="/" className="label text-fg transition-colors dur-fast hover:text-accent">
          MFZ<span className="text-accent">/</span>CONSOLE
        </Link>
        <div className="flex items-center gap-s3 sm:gap-s4">
          {items.map((it) => {
            const active =
              it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`label transition-colors dur-fast hover:text-accent ${
                  active ? "text-accent" : "text-fg-muted"
                }`}
              >
                {active && <span aria-hidden>▪ </span>}
                {it.tag}
              </Link>
            );
          })}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
