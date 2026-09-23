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

gsap.registerPlugin(ScrollTrigger);

let activeUntil = 0;
let ambient = false;
let tick = 0;
let lastRender = 0;
let running = false;
const samples: number[] = [];

/** Keep rendering at full rate for at least `ms`. Anything that moves calls this. */
export function wake(ms = 400) {
  const t = performance.now() + ms;
  if (t > activeUntil) activeUntil = t;
}

/** Ambient motion present (idle drift, fidgets, sway): render at half rate when otherwise idle. */
export function setAmbient(on: boolean) {
  ambient = on;
}

export type Loop = { lenis: Lenis; stop: () => void };

let current: Lenis | null = null;

/** Scroll to a station's section (the worker's "next" and the depth tag both land here). */
export function scrollToStation(i: number) {
  const el = document.querySelector<HTMLElement>(`section[data-station="${i}"]`);
  if (!el) return;
  // centre of the section = the middle of its dwell
  const y = el.offsetTop + el.offsetHeight / 2 - innerHeight / 2;
  if (current) current.scrollTo(y, { duration: 2.4, immediate: matchMedia("(prefers-reduced-motion: reduce)").matches });
  else scrollTo({ top: y });
}

/**
 * `onSlow` fires when full-rate frames average over 26 ms (≈ under 40 fps) for 2 s of real activity:
 * the quality tier steps down (§6.10). Idle half-rate frames are never counted.
 */
export function startLoop({ onSlow, smooth }: { onSlow: () => void; smooth: boolean }): Loop {
  const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: motion.lenisLerp, smoothWheel: smooth });
  current = lenis;
  lenis.on("scroll", () => {
    ScrollTrigger.update();
    wake(700);
  });

  const onTick = (time: number) => {
    lenis.raf(time * 1000);
    if (!running) return;
    const now = performance.now();
    tick++;
    const active = now < activeUntil;
    if (!active && !(ambient && tick % 2 === 0)) return;
    if (active && lastRender && now - lastRender < 60) {
      samples.push(now - lastRender);
      if (samples.length >= 120) {
        const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
        samples.length = 0;
        if (mean > 26) onSlow();
      }
    } else if (!active) samples.length = 0;
    lastRender = now;
    advance(time);
  };

  const onVisibility = () => (document.hidden ? gsap.ticker.sleep() : (gsap.ticker.wake(), wake(300)));

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
