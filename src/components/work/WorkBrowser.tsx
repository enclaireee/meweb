"use client";

import { useState, useSyncExternalStore, type PointerEvent } from "react";
import { Link } from "next-view-transitions";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { projects } from "@/content";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { projectPlaceholder } from "@/lib/project-media";
import { DUR, EASE } from "@/lib/motion";

const noopSubscribe = () => () => {};
const hasHoverPreview = () =>
  window.matchMedia("(pointer: fine)").matches &&
  window.matchMedia("(min-width: 64rem)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The work browser: oversized title rows; on desktop a floating preview
 * follows the cursor and crossfades between projects. Touch and
 * reduced-motion get inline editorial images instead — designed, not
 * degraded.
 */
export function WorkBrowser() {
  const preview = useSyncExternalStore(noopSubscribe, hasHoverPreview, () => false);
  const [hovered, setHovered] = useState<string | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 28, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 250, damping: 28, mass: 0.5 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!preview) return;
    x.set(e.clientX + 28);
    y.set(e.clientY - 120);
  };

  return (
    <div onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
      <Stagger>
        {projects.map((p, i) => (
          <StaggerItem key={p.slug}>
            <Link
              href={`/work/${p.slug}`}
              data-cursor="open"
              onMouseEnter={() => setHovered(p.slug)}
              onFocus={() => setHovered(p.slug)}
              onBlur={() => setHovered(null)}
              className="group block border-t border-border py-8 lg:py-10"
            >
              {/* inline image for touch / reduced-motion contexts */}
              {!preview && (
                <div className="mb-6 aspect-[4/3] max-w-md overflow-hidden">
                  <Placeholder id={projectPlaceholder[p.slug]} />
                </div>
              )}

              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <span className="flex items-baseline gap-5">
                  <span className="annot text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={`font-display text-title transition-all duration-300 ease-(--ease-out-expo) group-hover:translate-x-2 ${
                      hovered && hovered !== p.slug ? "text-muted" : "text-foreground"
                    }`}
                  >
                    {p.title}
                  </span>
                </span>
                <span className="annot text-muted">
                  {p.domain} · {p.year}
                  {p.status === "in-progress" && <span className="ml-2 text-accent">●</span>}
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
      <div className="border-t border-border" />

      {/* floating preview */}
      {preview && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-20 w-72 xl:w-80"
          style={{ x: sx, y: sy }}
        >
          <AnimatePresence>
            {hovered && (
              <motion.div
                key={hovered}
                className="aspect-[4/3] overflow-hidden border border-border"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: DUR.base, ease: EASE.outExpo }}
              >
                <Placeholder id={projectPlaceholder[hovered]} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
