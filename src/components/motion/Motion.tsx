"use client";

import { AnimatePresence, LazyMotion, domMax } from "motion/react";

/**
 * One motion tree for the whole app. The shared-element morph needs the work
 * card and the overlay to be measured by the same instance, and those live in
 * two different route slots — so the provider has to sit above both, in the
 * root layout.
 *
 * `domMax`, not `domAnimation`: the smaller bundle has no layout animations at
 * all, so layoutId silently does nothing with it.
 *
 * Loaded statically. The dynamic-import form was tried and measured worse:
 * LCP 2.8s → 2.9s and total weight 298 → 333 KiB, because the split chunk is
 * fetched anyway and costs a second request. Left static on the evidence.
 */
export function Motion({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
      {/* The modal slot goes to null when the route closes. AnimatePresence
          holds the outgoing overlay long enough to animate it back to the
          card, instead of the overlay simply vanishing. */}
      <AnimatePresence>{modal}</AnimatePresence>
    </LazyMotion>
  );
}
