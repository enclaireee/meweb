"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group, PerspectiveCamera } from "three";
import { camera as cam, motion } from "@/design/tokens";
import { damp, DEG, clamp } from "@/lib/math";
import { fast, store } from "@/scene/store";
import { wake } from "@/scene/loop";
import { stepSpring, springActive, type Spring } from "@/scene/motion/spring";
import { cameraZ, archZ } from "./path";
import { shadows } from "@/scene/light/shadows";
import { baking } from "@/scene/bake";

/** What the rest of the scene reads each frame (transient, never rendered from). */
export const view = {
  /** smoothed station coordinate the camera is at */
  s: 0,
  /** damped aim, −1..1: pointer + drag + device tilt */
  aimX: 0,
  aimY: 0,
  /** the idle drift's current x offset (the lamp doesn't ride it) */
  drift: 0,
  time: 0,
};

/** what the shadows last saw: they only re-render when the lamp or the box tilt actually moved */
const seen = { s: NaN, x: NaN, y: NaN };
/** the light aim published to CSS, and when (≤ 30 Hz: it restyles the whole page) */
const published = { x: NaN, y: NaN, at: 0 };

/**
 * The camera rig (design.md §4.1, architecture.md §6.6): scroll dolly, pointer offset, idle drift,
 * and the box tilt, which rotates the world group about the current station rather than the camera.
 * The plate column is cleared with an off-axis view offset: the vanishing point moves, nothing warps.
 */
export function CameraRig({ children }: { children: ReactNode }) {
  const world = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const sway = useRef<{ el: HTMLElement | null; spring: Spring; lastX: number }>({ el: null, spring: { x: 0, v: 0 }, lastX: 0 });

  // lens + off-axis offset on resize only
  useEffect(() => {
    const camera = get().camera as PerspectiveCamera;
    const aspect = size.width / size.height;
    const t = clamp((aspect - 0.8) / (1.2 - 0.8), 0, 1);
    camera.fov = cam.fovPortrait + (cam.fovLandscape - cam.fovPortrait) * t;
    camera.near = cam.near;
    camera.far = cam.far;
    const w = size.width;
    const h = size.height;
    // desktop/tablet: the plate column is on the right, so the aisle sits left of centre;
    // phone: the bottom card, so the scene rides up
    // the phone rooms are baked for their own stage window: no offset (mobile_concept.md §4.2)
    if (baking()) camera.clearViewOffset();
    else if (w >= 1024) camera.setViewOffset(w, h, w * 0.12, 0, w, h);
    else if (w >= 640) camera.setViewOffset(w, h, w * 0.1, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.2, w, h);
    camera.updateProjectionMatrix();
    sway.current.el = document.querySelector<HTMLElement>("[data-sway]");
    wake(300);
  }, [get, size]);

  useFrame((state, delta) => {
    const camera = state.camera;
    const dt = Math.min(delta, 0.1);
    view.time += dt;
    const { reducedMotion, tier } = store.getState();

    // dolly: damped toward the scroll coordinate; under reduced motion, a cut between rests
    if (reducedMotion) {
      const target = Math.round(fast.s);
      if (target !== view.s) {
        // a cut between rests, softened by a 200 ms cross-fade (design.md §10)
        const el = document.querySelector<HTMLElement>("[data-canvas]");
        if (el) {
          el.style.transition = "none";
          el.style.opacity = "0";
          setTimeout(() => {
            el.style.transition = "opacity 200ms";
            el.style.opacity = "1";
          }, 20);
        }
        wake(300);
      }
      view.s = target;
    } else {
      const before = view.s;
      view.s = damp(view.s, fast.s, 3.5, dt);
      if (Math.abs(view.s - fast.s) < 1e-4) view.s = fast.s;
      if (Math.abs(view.s - before) > 1e-5) wake(200);
    }

    // aim: pointer + horizontal drag + device tilt, damped (λ 2.5)
    const tx = clamp(fast.pointerX + fast.dragX + fast.tiltX, -1, 1);
    const ty = clamp(fast.pointerY + fast.tiltY, -1, 1);
    view.aimX = damp(view.aimX, tx, motion.pointerLambda, dt);
    view.aimY = damp(view.aimY, ty, motion.pointerLambda, dt);
    // settle exactly once it's within a hair (an exponential never arrives, and every frame it's "still
    // moving" is a frame and a shadow pass)
    if (Math.abs(view.aimX - tx) < 5e-4) view.aimX = tx;
    if (Math.abs(view.aimY - ty) < 5e-4) view.aimY = ty;
    if (view.aimX !== tx || view.aimY !== ty) wake(200);

    view.drift = !reducedMotion && tier !== "low" ? cam.driftX * Math.sin((view.time * Math.PI * 2) / cam.driftPeriod) : 0;
    camera.position.set(view.aimX * cam.pointerX + view.drift, cam.restY + view.aimY * cam.pointerY, cameraZ(view.s));
    camera.rotation.set(cam.pitchDeg * DEG, 0, 0);

    // box tilt about the current stage (not the world origin: far stations would swing wildly)
    const pivotZ = archZ(view.s) - 26;
    if (world.current && inner.current) {
      world.current.position.set(0, 12, pivotZ);
      inner.current.position.set(0, -12, -pivotZ);
      world.current.rotation.set(-view.aimY * cam.tiltPitchDeg * DEG, view.aimX * cam.tiltYawDeg * DEG, 0);
    }
    // the lamp rides the dolly and the aim, and the tilt turns every caster under it: those, and only
    // those, move the shadows (the drift moves the eye, not the light)
    if (view.s !== seen.s || view.aimX !== seen.x || view.aimY !== seen.y) {
      seen.s = view.s;
      seen.x = view.aimX;
      seen.y = view.aimY;
      shadows.dirty = true;
    }

    // the light aim, shared with the HTML paper (design.md §5.4): 1/100 steps (a fifth of a pixel of
    // shadow), and at most 30 times a second, because a variable on <html> restyles every element
    const lx = Math.round(view.aimX * 100) / 100;
    const ly = Math.round(view.aimY * 100) / 100;
    const now = state.clock.elapsedTime;
    if ((lx !== published.x || ly !== published.y) && (now - published.at >= 1 / 30 || (view.aimX === tx && view.aimY === ty))) {
      published.x = lx;
      published.y = ly;
      published.at = now;
      const root = document.documentElement.style;
      root.setProperty("--light-x", String(lx));
      root.setProperty("--light-y", String(ly - 0.4));
    } else if (lx !== published.x || ly !== published.y) wake(40);

    // the title tag swings on its string when the lamp sweeps past it fast (station 0 only)
    const sw = sway.current;
    if (sw.el && !reducedMotion && view.s < 0.6) {
      const v = (fast.pointerX - sw.lastX) / Math.max(dt, 1e-3);
      if (Math.abs(v) > 2.5) sw.spring.v += clamp(v, -12, 12) * 0.35;
      stepSpring(sw.spring, 0, dt);
      if (springActive(sw.spring, 0)) {
        wake(100);
        sw.el.style.rotate = `${sw.spring.x.toFixed(3)}deg`;
      }
    }
    sw.lastX = fast.pointerX;
  }, -10);

  return (
    <group ref={world}>
      <group ref={inner}>{children}</group>
    </group>
  );
}
