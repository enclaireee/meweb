"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import styles from "./Worker.module.css";
import { worker as W } from "@/design/tokens";
import { clamp, damp, DEG } from "@/lib/math";
import { seeded } from "@/lib/rng";
import { LAST_STATION } from "@/sections/stations";
import { fast, store } from "@/scene/store";
import { scrollToStation, wake } from "@/scene/loop";
import { view } from "@/scene/camera/rig";
import { shadows } from "@/scene/light/shadows";
import { afterEntrance } from "@/scene/entrance";
import { stepSpring, springActive, type Spring } from "@/scene/motion/spring";
import { WorkerRig, applyPose, type Joints } from "./rig";
import { cable, cableLength, restU } from "./path";
import { cycleDistance, mix, pose, rest, type Pose } from "./walk";


/** Everything the loop mutates. One worker, so module state is honest. */
const w = {
  u: 0,
  speed: 0,
  phase: 0.25,
  walking: 0,
  yaw: 50 * DEG,
  heading: 1,
  entering: null as null | { t: number; dur: number; from: Vector3; to: Vector3 },
  tease: null as null | { back: number; until: number },
  arrivedAt: -1,
  hat: { x: 0, v: 0 } as Spring,
  head: 0,
  headTarget: 0,
  clip: 0,
  clipTarget: 0,
  nextFidget: 3,
  visible: false,
  screen: { x: 0, y: 0, on: false },
};

const slowV = cycleDistance(W.slow) / W.slow.cycle; // ≈ 1.45 u/s
const briskV = cycleDistance(W.brisk) / W.brisk.cycle; // ≈ 2.53 u/s
const P = new Vector3();
const T = new Vector3();
const HEAD = new Vector3();

/** Click / Enter on the worker: a few steps at the desk the first time, then the next station. */
export function pokeWorker() {
  const { reducedMotion, station } = store.getState();
  if (!reducedMotion && Math.round(view.s) === 0 && !w.tease && w.arrivedAt === 0) {
    w.tease = { back: w.u, until: view.time + 2.8 };
    wake(3000);
    return;
  }
  scrollToStation(Math.min(Math.max(station, Math.round(view.s)) + 1, LAST_STATION));
}

/** The worker in the scene (design.md §8, portfolio_concept.md §4). */
export function Worker() {
  const root = useRef<Group>(null);
  const joints = useRef<Joints>(new Map());

  // entrance: he walks in from the left and stops by the plug
  useEffect(() => {
    w.u = restU(0);
    cable.getPointAt(w.u, P);
    const hook = ({ returning }: { returning: boolean }) => {
      if (store.getState().reducedMotion) return;
      w.entering = { t: 0, dur: returning ? 1.4 : 3, from: new Vector3(P.x - 13, 0, P.z - 1.5), to: P.clone() };
      wake(3500);
    };
    afterEntrance.push(hook);
    return () => {
      const i = afterEntrance.indexOf(hook);
      if (i >= 0) afterEntrance.splice(i, 1);
    };
  }, []);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;
    const dt = Math.min(delta, 0.1);
    const { reducedMotion, sceneLive } = store.getState();

    // --- where he should be ------------------------------------------------------------
    let p: Pose = rest;
    let moved = false;
    if (reducedMotion) {
      // he stands at the current station; no walking (design.md §10)
      w.u = restU(Math.round(fast.s));
      w.speed = 0;
      cable.getPointAt(w.u, P);
    } else if (w.entering) {
      const e = w.entering;
      e.t += dt;
      const k = clamp(e.t / e.dur, 0, 1);
      P.lerpVectors(e.from, e.to, k);
      w.speed = k < 1 ? e.from.distanceTo(e.to) / e.dur : 0;
      w.heading = 1;
      if (k >= 1) {
        w.entering = null;
        w.arrivedAt = -1;
      }
      moved = true;
    } else {
      let target = restU(Math.round(fast.s));
      if (w.tease) {
        target = view.time < w.tease.until - 1.3 ? w.tease.back + 3 / cableLength : w.tease.back;
        if (view.time > w.tease.until) w.tease = null;
      }
      const dist = (target - w.u) * cableLength;
      // puppet on a stick: slid as fast as the journey needs, eased in and out (design.md §8)
      const desired = clamp(dist * 1.6, -80, 80);
      const ease = Math.abs(desired) > Math.abs(w.speed) ? 1 / W.slow.ease : 1 / W.brisk.ease;
      w.speed = damp(w.speed, Math.abs(dist) < 0.02 ? 0 : desired, ease, dt);
      w.u = clamp(w.u + (w.speed * dt) / cableLength, 0, 1);
      if (Math.abs(w.speed) > 0.05) w.heading = Math.sign(w.speed);
      cable.getPointAt(w.u, P);
      moved = Math.abs(w.speed) > 0.01;
    }

    // --- how he moves: gait from speed, cadence capped at brisk (faster = slid) -------
    const v = Math.abs(w.speed);
    w.walking = damp(w.walking, v > 0.08 ? 1 : 0, 6, dt);
    if (v > 0.01 || w.walking > 0.02) {
      const blend = clamp((v - slowV) / (briskV - slowV), 0, 1);
      const cycle = W.slow.cycle + (W.brisk.cycle - W.slow.cycle) * blend;
      const rate = Math.min(v / cycleDistance(blend < 0.5 ? W.slow : W.brisk), 1 / W.brisk.cycle);
      w.phase += Math.max(rate, w.walking > 0.02 ? 0.25 / cycle : 0) * dt;
      p = mix(rest, mix(pose(w.phase, W.slow), pose(w.phase, W.brisk), blend), w.walking);
    } else {
      // settle to legs-together, then the arrival beat: a tip of the hard hat
      w.phase = Math.round(w.phase * 2 - 0.5) / 2 + 0.25;
      const here = Math.round(fast.s);
      if (w.arrivedAt !== here && sceneLive && !reducedMotion && !w.tease) {
        w.arrivedAt = here;
        w.hat.v += 5;
      }
    }

    // --- facing: along the cable, clamped so the flat puppet never goes edge-on at rest
    if (!w.entering) cable.getTangentAt(w.u, T);
    else T.set(1, 0, 0);
    const hx = T.x * w.heading;
    const hz = T.z * w.heading;
    let yaw = Math.atan2(-hz, hx);
    const lim = W.yawClampDeg * DEG;
    yaw = Math.abs(yaw) <= Math.PI / 2 ? clamp(yaw, -lim, lim) : yaw > 0 ? clamp(yaw, Math.PI - lim, Math.PI) : clamp(yaw, -Math.PI, -Math.PI + lim);
    // turn about through the edge (0.6 s), taking the short way round
    let d = yaw - w.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    w.yaw += d * (1 - Math.exp(-dt / (W.turnTime / 4)));
    if (Math.abs(d) > 0.01) moved = true;

    // --- fidgets while idle (one every 4–7 s): hat, a look up at the lamp, the clipboard
    if (!reducedMotion && w.walking < 0.05 && sceneLive) {
      w.nextFidget -= dt;
      if (w.nextFidget <= 0) {
        const rng = seeded(`fidget:${Math.floor(view.time)}`);
        const pick = rng();
        if (pick < 0.3) w.hat.v += 3;
        else if (pick < 0.65) w.headTarget = 12 * DEG;
        else w.clipTarget = -35 * DEG;
        w.nextFidget = W.fidget[0] + (W.fidget[1] - W.fidget[0]) * rng();
        setTimeout(() => ((w.headTarget = 0), (w.clipTarget = 0), wake(1200)), 1300);
        wake(1500);
      }
    }
    w.head = damp(w.head, w.headTarget, 5, dt);
    w.clip = damp(w.clip, w.clipTarget, 5, dt);
    stepSpring(w.hat, 0, dt);
    const idleMoving = springActive(w.hat, 0) || Math.abs(w.head - w.headTarget) > 1e-3 || Math.abs(w.clip - w.clipTarget) > 1e-3;

    // --- apply ------------------------------------------------------------------------
    g.position.set(P.x, 0, P.z);
    g.rotation.y = w.yaw;
    applyPose(joints.current, p, { head: w.head, clip: w.clip, hat: Math.max(0, w.hat.x) * 0.12 });

    if (moved || idleMoving || w.walking > 0.02) {
      shadows.dirty = true;
      wake(150);
    }

    // --- where he is on screen, for the HTML button (≤ 30 Hz) --------------------------
    if (Math.floor(state.clock.elapsedTime * 30) !== Math.floor((state.clock.elapsedTime - dt) * 30)) {
      HEAD.set(0, 2.6, 0).applyMatrix4(g.matrixWorld).project(state.camera);
      w.screen.on = HEAD.z < 1 && Math.abs(HEAD.x) < 1 && Math.abs(HEAD.y) < 1;
      w.screen.x = (HEAD.x * 0.5 + 0.5) * state.size.width;
      w.screen.y = (-HEAD.y * 0.5 + 0.5) * state.size.height;
      const btn = document.querySelector<HTMLElement>("[data-worker]");
      if (btn) {
        btn.style.translate = `${w.screen.x.toFixed(0)}px ${w.screen.y.toFixed(0)}px`;
        if (w.screen.on && sceneLive) btn.dataset.on = "";
        else delete btn.dataset.on;
      }
    }
  });

  return (
    <group ref={root} rotation-y={50 * DEG}>
      <WorkerRig joints={joints} />
    </group>
  );
}

/** The HTML handle (architecture.md §6.9): a real button over him, keyboard and screen-reader friendly. */
export function WorkerLayer() {
  return (
    <button type="button" data-worker className={styles.button} onClick={pokeWorker} aria-label="Walk to the next station">
      <span className={styles.label}>Walk on</span>
    </button>
  );
}
