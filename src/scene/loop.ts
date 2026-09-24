/**
 * The single loop (architecture.md §6.7): the GSAP ticker is the only requestAnimationFrame.
 * Lenis and ScrollTrigger ride it, and R3F (frameloop="never") renders only when something moved.
 * Ambient life (drift, fidgets, sway) renders at half rate: alive, not busy, and kind to batteries.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { advance } from "@react-three/fiber";
import { motion } from "@/design/tokens";
import { store } from "./store";

gsap.registerPlugin(ScrollTrigger);

let activeUntil = 0;
let ambient = false;
let tick = 0;
let lastRender = 0;
let renderedLast = false;
let running = false;
let lastInput = 0;
const samples: number[] = [];

/** Keep rendering at full rate for at least `ms`. Anything that moves calls this. */
export function wake(ms = 400) {
  const t = performance.now() + ms;
  if (t > activeUntil) activeUntil = t;
}

/**
 * Ambient life asking for frames (a fidget): the half-rate ambient frames carry it when they're on;
 * only when they're off (low tier) does it need full-rate frames of its own, or it would freeze mid-move.
 */
export function nudge(ms: number) {
  if (!ambient) wake(ms);
}

/** The visitor did something (pointer, scroll, touch, key): idle life can wind down without it. */
export function noteInput() {
  lastInput = performance.now();
}

/** Seconds since the visitor last did anything. */
export const idleFor = () => (performance.now() - lastInput) / 1000;

/** Ambient motion present (idle drift, fidgets, sway): render at half rate when otherwise idle. */
export function setAmbient(on: boolean) {
  ambient = on;
}

export type Loop = { lenis: Lenis; stop: () => void };

let current: Lenis | null = null;

/** centre of a station's section = the middle of its dwell */
const restY = (el: HTMLElement) => el.offsetTop + el.offsetHeight / 2 - innerHeight / 2;

/** Scroll to a station's section (the worker's "next" and the depth tag both land here). */
export function scrollToStation(i: number) {
  const el = document.querySelector<HTMLElement>(`section[data-station="${i}"]`);
  if (!el) return;
  const y = restY(el);
  if (current) current.scrollTo(y, { duration: 2.4, immediate: matchMedia("(prefers-reduced-motion: reduce)").matches });
  else scrollTo({ top: y });
}

/** median of a sample window (a single long station build mustn't read as a slow device) */
function median(a: number[]) {
  const s = a.slice().sort((x, y) => x - y);
  return s[s.length >> 1]!;
}

/**
 * `onSlow` fires when back-to-back full-rate frames take a median of over 26 ms (≈ under 40 fps) across
 * 2 s of real activity: the quality tier steps down (§6.10). Idle half-rate frames are never counted,
 * but slow frames always are, however slow (a 5 fps phone must step down too).
 */
export function startLoop({ onSlow, smooth }: { onSlow: () => void; smooth: boolean }): Loop {
  const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: motion.lenisLerp, smoothWheel: smooth });
  current = lenis;
  lenis.on("scroll", () => {
    ScrollTrigger.update();
    lastInput = performance.now();
    // one frame is enough to start: the camera rig keeps itself awake until it has caught up
    wake(150);
  });
  lastInput = performance.now();

  // A deep link (/#refocus) is still in the browser's own smooth scroll when Lenis takes the page over,
  // which stops it dead a room short. Land it on its room's rest instead.
  const linked = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  const room = linked?.closest<HTMLElement>("section[data-station]");
  if (room) lenis.scrollTo(restY(room), { immediate: true, force: true });

  let sampled = 0;
  const onTick = (time: number) => {
    lenis.raf(time * 1000);
    if (!running) return;
    const now = performance.now();
    tick++;
    const active = now < activeUntil;
    if (!active && !(ambient && tick % 2 === 0)) {
      renderedLast = false;
      return;
    }
    // consecutive full-rate frames only: the gap is then the real cost of a frame (a hidden tab sleeps
    // the ticker, so a gap over a second is a pause, not a frame)
    const gap = now - lastRender;
    // (not while the scene is still being built behind the curtain: that's loading, not running)
    if (active && renderedLast && gap < 1000 && store.getState().sceneLive) {
      samples.push(gap);
      sampled += gap;
      if (samples.length >= 20 && sampled >= 2000) {
        const slow = median(samples) > 26;
        samples.length = 0;
        sampled = 0;
        if (slow) onSlow();
      }
    }
    renderedLast = true;
    lastRender = now;
    advance(time);
  };

  const onVisibility = () => {
    if (document.hidden) return gsap.ticker.sleep();
    // back from the background: no stale samples, no huge first delta (R3F's clock is fed our time)
    samples.length = 0;
    sampled = 0;
    renderedLast = false;
    gsap.ticker.wake();
    wake(300);
  };

  running = true;
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);
  document.addEventListener("visibilitychange", onVisibility);
  wake(1000);

  return {
    lenis,
    stop() {
      running = false;
      gsap.ticker.remove(onTick);
      document.removeEventListener("visibilitychange", onVisibility);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
      current = null;
    },
  };
}

/** Pause rendering while the canvas is off-screen or hidden by a tier change. */
export function setRunning(on: boolean) {
  running = on;
  if (on) wake(300);
}
