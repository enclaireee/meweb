"use client";

import { useEffect, useRef, useState } from "react";
import { advanceLoading, store, useScene } from "@/scene/store";
import styles from "./Loader.module.css";

const lines: [number, string][] = [
  [0, "Sharpening the scissors"],
  [0.25, "Cutting the sheets"],
  [0.5, "Folding the arches"],
  [0.7, "Hanging the moon"],
  [0.85, "Waking the worker"],
  [0.99, "Lights up"],
];

/** Times from navigation start: the curtain is up from first paint, not from hydration. */
const MIN_MS = 1100;
/**
 * The scene may delay nothing (portfolio_concept.md §2): past this the bar runs out and the curtain
 * parts on the readable page and its poster; the box pops up behind it whenever it's ready.
 */
const CAP_MS = 2000;

const lineAt = (p: number) => [...lines].reverse().find(([at]) => p >= at)?.[1] ?? lines[0]![1];

/**
 * The loading screen (decisions.md: "curtain + worker cutting"): a paper stage curtain; in front of it
 * the worker walks a pair of scissors along a strip as the workshop loads. When it's ready (or after
 * CAP_MS, whichever comes first) the curtain parts. Only with JS (no-JS readers get the page straight
 * away), and the page underneath is complete HTML the whole time.
 */
export function Loader() {
  const open = useScene((s) => s.curtainOpen);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pctEl = useRef<HTMLSpanElement>(null);
  const lineEl = useRef<HTMLSpanElement>(null);
  const shownRef = useRef(0);

  // fonts are the first real stage; everything after is reported by the scene
  useEffect(() => {
    advanceLoading(0.08);
    document.fonts?.ready.then(() => advanceLoading(0.28));
  }, []);

  // the bar creeps between stages and jumps when one lands. A timer writing to the DOM, not React
  // state: this runs while the main thread is busiest (parsing three, cutting the desk)
  useEffect(() => {
    if (open) return;
    const id = window.setInterval(() => {
      const { progress, tier } = store.getState();
      const now = performance.now();
      // no WebGL / Save-Data: there's nothing to wait for
      if (tier === "none") return store.setState({ curtainOpen: true });
      if (now > CAP_MS) advanceLoading(1);
      // a slow device hydrated after the cap had already passed: no more waiting on a bar
      if (now > CAP_MS + 400) shownRef.current = 1;
      const target = store.getState().progress;
      const goal = Math.max(target, Math.min(0.92, shownRef.current + 0.004));
      shownRef.current += (goal - shownRef.current) * (progress >= 1 ? 0.35 : 0.2);
      if (target >= 1 && shownRef.current > 0.985) shownRef.current = 1;
      const p = Math.min(shownRef.current, 1);
      const pct = String(Math.round(p * 100));
      root.current?.style.setProperty("--p", String(p));
      root.current?.setAttribute("aria-valuenow", pct);
      if (pctEl.current) pctEl.current.textContent = `${pct}%`;
      if (lineEl.current) lineEl.current.textContent = `${lineAt(p)}…`;
      if (p >= 1 && now > MIN_MS) store.setState({ curtainOpen: true });
    }, 80);
    return () => clearInterval(id);
  }, [open]);

  // once parted, get out of the way entirely
  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.loaded = "";
    const id = window.setTimeout(() => setGone(true), 1500);
    return () => clearTimeout(id);
  }, [open]);

  if (gone) return null;

  return (
    <div
      ref={root}
      className={styles.loader}
      data-open={open || undefined}
      role="progressbar"
      aria-label="Loading the workshop"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div className={`${styles.curtain} ${styles.left}`} aria-hidden />
      <div className={`${styles.curtain} ${styles.right}`} aria-hidden />
      <div className={styles.valance} aria-hidden />

      <div className={`cast ${styles.stage}`} aria-hidden>
        <div className={`${styles.card} paper grain`}>
          <p className="text-kicker uppercase text-ink-soft">Muhammad Fatih Zamzami · a portfolio</p>
          <p className={styles.title}>The Night Workshop</p>

          <div className={styles.cut}>
            {/* the strip being cut: the cut part parts along the dashed line */}
            <div className={styles.strip}>
              <span className={styles.stripTop} />
              <span className={styles.stripBottom} />
            </div>
            <div className={styles.walker}>
              <Scissors />
              <Puppet />
            </div>
          </div>

          <p className={`${styles.status} text-caption italic`}>
            <span ref={lineEl}>{lines[0]![1]}…</span>
            <span ref={pctEl} className="tabular-nums">
              0%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Scissors() {
  return (
    <svg className={styles.scissors} viewBox="-12 -8 24 16">
      <g className={styles.bladeTop}>
        <path d="M-1 -0.6 L11 -2.2 L11.4 -1.2 L-0.6 0.6 Z" fill="#9BA5B7" />
        <path d="M-5.2 -5.6 a3 3 0 1 0 0.001 0 Z M-5.2 -4.2 a1.6 1.6 0 1 1 -0.001 0 Z" fill="#D9553B" fillRule="evenodd" />
      </g>
      <g className={styles.bladeBottom}>
        <path d="M-1 0.6 L11 2.2 L11.4 1.2 L-0.6 -0.6 Z" fill="#9BA5B7" />
        <path d="M-5.2 5.6 a3 3 0 1 0 0.001 0 Z M-5.2 7 a1.6 1.6 0 1 1 -0.001 0 Z" fill="#D9553B" fillRule="evenodd" />
      </g>
      <circle r="0.9" fill="#3C3B42" />
    </svg>
  );
}

/** The worker, flat, walking the scissors along (the same paper as in the scene). */
function Puppet() {
  return (
    <svg className={styles.puppet} viewBox="-1.2 0.6 2.4 5.6">
      <g className={styles.legBack}>
        <path d="M-0.2 3.62 L0.2 3.62 L0.18 5.6 H-0.18 Z" fill="#3E62A8" />
        <path d="M-0.24 5.5 H0.38 C0.56 5.5 0.64 5.66 0.64 5.84 V6 H-0.24 Z" fill="#5B3A27" />
      </g>
      <g className={styles.armBack}>
        <path d="M-0.16 2.35 L0.16 2.35 L0.4 3.6 L0.12 3.72 Z" fill="#E6B08A" />
      </g>
      <path d="M-0.55 3.9 V2.6 C-0.55 2.3 -0.32 2.12 0 2.12 C0.3 2.12 0.52 2.3 0.52 2.6 V3.9 Z" fill="#3E62A8" />
      <path d="M-0.5 3.72 V2.7 C-0.5 2.42 -0.3 2.28 -0.06 2.28 H0.16 L0.47 2.95 V3.72 Z" fill="#E8742F" />
      <path d="M-0.5 3.02 H0.48 V3.4 H-0.5 Z" fill="#3E62A8" />
      <path d="M0.05 1.2 C0.34 1.2 0.49 1.38 0.52 1.58 L0.66 1.74 L0.52 1.82 C0.48 2.02 0.3 2.14 0.05 2.14 C-0.23 2.14 -0.42 1.94 -0.42 1.67 C-0.42 1.4 -0.23 1.2 0.05 1.2 Z" fill="#E6B08A" />
      <circle cx="0.28" cy="1.6" r="0.1" fill="#3C3B42" />
      <path d="M-0.43 1.36 C-0.43 1.02 -0.12 0.8 0.12 0.8 C0.42 0.8 0.62 1.05 0.62 1.36 Z M-0.5 1.3 H0.86 V1.52 H-0.5 Z" fill="#F4C430" />
      <g className={styles.legFront}>
        <path d="M-0.2 3.62 L0.2 3.62 L0.18 5.6 H-0.18 Z" fill="#3E62A8" />
        <path d="M-0.24 5.5 H0.38 C0.56 5.5 0.64 5.66 0.64 5.84 V6 H-0.24 Z" fill="#5B3A27" />
      </g>
      <g className={styles.armFront}>
        <path d="M-0.16 2.35 L0.16 2.35 L0.62 3.3 L0.36 3.46 Z" fill="#F1E6CF" />
      </g>
    </svg>
  );
}
