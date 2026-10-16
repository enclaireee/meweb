"use client";
// Lantern loader: a paper lantern lights from the bottom as the art decodes, then flies onto the boat's lantern.
// Everything it animates is transform / opacity, plus one mask radius on its own flat backdrop.
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { copy } from "@/content/site";
import s from "./Loader.module.css";

const FILL_MS = 350; // last bit of fill before the flight (matches the .litWin transition)
const FLY_MS = 520;
const FADE_MS = 1100; // the light circle opening (Loader.module.css open)

const reduced = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "reduced";

/** Flat cut-paper lantern with a kawung cut-out; `lit` swaps the palette. */
function Lantern({ lit }: { lit: boolean }) {
  return (
    <svg className={lit ? s.lit : s.unlit} viewBox="0 0 120 200" aria-hidden="true" focusable="false">
      <path className={s.shadow} d="M30 27h60v10h-60zM26 37C0 65 0 145 26 173h68C120 145 120 65 94 37z" transform="translate(4 5)" />
      <path className={s.cord} d="M60 0V22M60 178V200" />
      <path className={s.cap} d="M30 22h60v10H30zM30 168h60v10H30z" />
      <path className={s.body} d="M26 32C0 60 0 140 26 168h68C120 140 120 60 94 32z" />
      <path className={s.rib} d="M44 32C24 70 24 130 44 168M76 32C96 70 96 130 76 168" />
      <g className={s.motif}>
        <ellipse cx="60" cy="86" rx="5" ry="11" />
        <ellipse cx="60" cy="114" rx="5" ry="11" />
        <ellipse cx="46" cy="100" rx="11" ry="5" />
        <ellipse cx="74" cy="100" rx="11" ry="5" />
      </g>
      <rect className={s.cap} x="56" y="194" width="8" height="6" />
    </svg>
  );
}

export function Loader(p: { progress: number; ready: boolean; onLanded: () => void; onGone: () => void }) {
  const { progress, ready } = p;
  const [phase, setPhase] = useState<"load" | "fly" | "fade">("load");
  const lantern = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const cb = useRef(p);
  useEffect(() => {
    cb.current = p;
  });

  // `progress` from preload() only ever grows; `ready` snaps it to 1.
  const fill = ready ? 1 : Math.min(1, Math.max(0, progress));

  useEffect(() => {
    if (!ready) return;
    const timers: number[] = [];
    const later = (f: () => void, ms: number) => timers.push(window.setTimeout(f, ms));
    const fade = () => {
      setPhase("fade");
      later(() => cb.current.onGone(), FADE_MS);
    };
    if (reduced()) {
      cb.current.onLanded();
      fade();
    } else {
      later(() => {
        const to = document.querySelector("[data-world] .tr-lantern")?.getBoundingClientRect();
        const el = lantern.current;
        if (!to || !el || !to.height) {
          cb.current.onLanded();
          fade();
          return;
        }
        const from = el.getBoundingClientRect();
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + to.height / 2 - (from.top + from.height / 2);
        const r = root.current!.getBoundingClientRect();
        root.current!.style.setProperty("--lx", `${to.left + to.width / 2 - r.left}px`);
        root.current!.style.setProperty("--ly", `${to.top + to.height / 2 - r.top}px`);
        setPhase("fly");
        el.style.transform = `translate(${dx}px, ${dy}px) scale(${to.height / from.height})`;
        later(() => {
          cb.current.onLanded();
          fade();
        }, FLY_MS);
      }, FILL_MS);
    }
    return () => timers.forEach(clearTimeout);
  }, [ready]);

  const pct = Math.round(fill * 100);
  return (
    <div
      ref={root}
      className={s.root}
      data-phase={phase}
      role="progressbar"
      aria-label={copy.loading}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className={s.lantern} ref={lantern}>
        <div className={s.glow} style={{ opacity: fill }} />
        <Lantern lit={false} />
        <div className={s.litClip}>
          <div className={s.litWin} style={{ "--cut": `${(168 - 146 * fill) / 2}%` } as CSSProperties}>
            <Lantern lit />
          </div>
        </div>
      </div>
      <p className={s.label}>
        {copy.loading} <span className={s.pct}>{pct}%</span>
      </p>
    </div>
  );
}
