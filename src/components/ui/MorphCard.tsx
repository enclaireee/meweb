"use client";

import { m } from "motion/react";

/**
 * The morph's source half, and nothing else.
 *
 * Slice 4 made the whole Work component client-side to get one `layoutId` onto
 * the cards, which shipped the entire index markup — six rows, the Frame
 * component, all of it — into the client bundle and cost 0.2s of LCP. This is
 * the smallest possible client boundary instead: children arrive already
 * rendered on the server, so only this wrapper is JavaScript.
 */
export function MorphCard({
  layoutId,
  className,
  children,
}: {
  layoutId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <m.div layoutId={layoutId} className={className}>
      {children}
    </m.div>
  );
}
