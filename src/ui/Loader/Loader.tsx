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

const MIN_MS = 1100;
const MAX_MS = 10000;

/**
 * The loading screen (decisions.md: "curtain + worker cutting"): a paper stage curtain; in front of it
 * the worker walks a pair of scissors along a strip as the workshop loads. When it's ready the curtain
 * parts and the box pops up behind it. Only with JS (no-JS readers get the page straight away), and
 * the page underneath is complete HTML the whole time.
 */
export function Loader() {
  const open = useScene((s) => s.curtainOpen);
  const [shown, setShown] = useState(0);
  const [gone, setGone] = useState(false);
  const shownRef = useRef(0);
  const started = useRef(0);

  // fonts are the first real stage; everything after is reported by the scene
  useEffect(() => {
    started.current = performance.now();
    advanceLoading(0.08);
    document.fonts?.ready.then(() => advanceLoading(0.28));
  }, []);

  // the bar creeps between stages and jumps when one lands (a timer, not a render loop: it stops)
  useEffect(() => {
    if (open) return;
    const id = window.setInterval(() => {
      const target = store.getState().progress;
      const goal = Math.max(target, Math.min(0.92, shownRef.current + 0.004));
      shownRef.current += (goal - shownRef.current) * 0.2;
      if (target >= 1 && shownRef.current > 0.985) shownRef.current = 1;
      setShown(shownRef.current);
      const elapsed = performance.now() - started.current;
      if ((shownRef.current >= 1 && elapsed > MIN_MS) || elapsed > MAX_MS) {
        store.setState({ curtainOpen: true });
      }
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
  const pct = Math.round(Math.min(shown, 1) * 100);
  const line = [...lines].reverse().find(([at]) => shown >= at)?.[1] ?? lines[0]![1];

  return (
    <div
      className={styles.loader}
      data-open={open || undefined}
      style={{ "--p": Math.min(shown, 1) } as React.CSSProperties}
      role="progressbar"
      aria-label="Loading the workshop"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
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
            <span>{line}…</span>
            <span className="tabular-nums">{pct}%</span>
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
