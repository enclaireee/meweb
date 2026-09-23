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

/** What the rest of the scene reads each frame (transient, never rendered from). */
export const view = {
  /** smoothed station coordinate the camera is at */
  s: 0,
  /** damped aim, −1..1: pointer + drag + device tilt */
  aimX: 0,
  aimY: 0,
  time: 0,
};

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
  const published = useRef({ x: NaN, y: NaN });
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
    if (w >= 1024) camera.setViewOffset(w, h, w * 0.12, 0, w, h);
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
    if (Math.abs(view.aimX - tx) > 1e-3 || Math.abs(view.aimY - ty) > 1e-3) wake(200);

    const drift = !reducedMotion && tier !== "low" ? cam.driftX * Math.sin((view.time * Math.PI * 2) / cam.driftPeriod) : 0;
    camera.position.set(view.aimX * cam.pointerX + drift, cam.restY + view.aimY * cam.pointerY, cameraZ(view.s));
    camera.rotation.set(cam.pitchDeg * DEG, 0, 0);

    // box tilt about the current stage (not the world origin: far stations would swing wildly)
    const pivotZ = archZ(view.s) - 26;
    if (world.current && inner.current) {
      world.current.position.set(0, 12, pivotZ);
      inner.current.position.set(0, -12, -pivotZ);
      world.current.rotation.set(-view.aimY * cam.tiltPitchDeg * DEG, view.aimX * cam.tiltYawDeg * DEG, 0);
    }
    shadows.dirty = true;

    // the light aim, shared with the HTML paper (design.md §5.4)
    const lx = Math.round(view.aimX * 200) / 200;
    const ly = Math.round(view.aimY * 200) / 200;
    if (lx !== published.current.x || ly !== published.current.y) {
      published.current = { x: lx, y: ly };
      const root = document.documentElement.style;
      root.setProperty("--light-x", String(lx));
      root.setProperty("--light-y", String(ly - 0.4));
    }

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
