"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import styles from "./Worker.module.css";
import { box, worker as W } from "@/design/tokens";
import { clamp, damp, DEG } from "@/lib/math";
import { seeded } from "@/lib/rng";
import { LAST_STATION } from "@/sections/stations";
import { fast, store } from "@/scene/store";
import { idleFor, nudge, scrollToStation, wake } from "@/scene/loop";
import { view } from "@/scene/camera/rig";
import { shadows } from "@/scene/light/shadows";
import { afterEntrance } from "@/scene/entrance";
import { stepSpring, springActive, type Spring } from "@/scene/motion/spring";
import { WorkerRig, applyPose, type Joints } from "./rig";
import { followPoint } from "./path";
import { cycleDistance, mix, pose, rest, type Pose } from "./walk";
import { action, overlay, DURATION, type ActionName, type Overlay } from "./actions";
import { routines } from "./routines";
import * as lines from "./lines";
import { bindBubble, pick, say } from "./speech";

const S = W.scale;
const slowV = (cycleDistance(W.slow) / W.slow.cycle) * S;
const briskV = (cycleDistance(W.brisk) / W.brisk.cycle) * S;

/**
 * With nobody at the box for this long he finishes the job in hand and takes a breather (fidgets only)
 * until someone moves again: alive, not busy (concept.md §8), and the box stops drawing at full rate.
 */
const REST_S = 45;

/** What the stations can read: is he working their prop right now? */
export const activity = { valve: false };

type Act = { name: ActionName; t: number; dur: number; idle?: boolean };

/** Everything the loop mutates. One worker, so module state is honest. (Exported read-only for ?debug.) */
export const w = {
  /** false until his entrance: hidden, and simply kept at the room the camera is in */
  onStage: false,
  mode: "follow" as "follow" | "job",
  pos: new Vector3(),
  prev: new Vector3(),
  target: new Vector3(),
  speed: 0,
  phase: 0.25,
  walking: 0,
  yaw: 50 * DEG,
  face: 0 as 0 | 1 | -1,
  entering: null as null | { t: number; dur: number; from: Vector3; to: Vector3; greet: boolean },
  routine: null as null | { station: number; order: number[]; job: number; step: number; t: number; pauseUntil: number; loops: number },
  settledFor: 0,
  act: null as Act | null,
  last: null as Act | null,
  actW: 0,
  pendingNext: false,
  arrivedAt: -1,
  hat: { x: 0, v: 0 } as Spring,
  head: 0,
  headTarget: 0,
  clip: 0,
  clipTarget: 0,
  nextFidget: 3,
  screen: { x: 0, y: 0, on: false },
  rushFor: 0,
  rushQuietUntil: 0,
};

const F = { x: 0, z: 0 };
// scratch poses, reused every frame
const SLOW: Pose = { ...rest };
const BRISK: Pose = { ...rest };
const BODY: Pose = { ...rest };
const NONE: Overlay = {};
const EXTRA = { head: 0, clip: 0, hat: 0, lift: 0 };
/** the HTML handle, set by WorkerLayer (no DOM query per frame) */
let handle: HTMLButtonElement | null = null;
const V = new Vector3();
const D = new Vector3(1, 0, 0);
const HEAD = new Vector3();

/** `idle`: a fidget of his own, not a job or a reply to you: it rides the half-rate ambient frames */
const startAct = (name: ActionName, dur = DURATION[name], idle = false) => {
  w.act = { name, t: 0, dur, idle };
  if (idle) nudge(dur * 1000 + 600);
  else wake(dur * 1000 + 600);
};

/** A reaction, if he's free to do it (not mid-job, not walking fast). */
export function react(name: ActionName, idle = false) {
  if (w.act || w.speed > 0.5 || store.getState().reducedMotion || !store.getState().sceneLive) return false;
  startAct(name, DURATION[name], idle);
  return true;
}

/** The station a poke is walking you to, until the camera gets there or the walk's time is up (you
 * may scroll somewhere else meanwhile): −1 for none. */
let walkingTo = -1;
let walkUntil = 0;

/**
 * Click / Enter on the worker: a hop of surprise, then off to the next station. One poke, one station:
 * pokes while he's already taking you somewhere don't stack up (spam-clicking used to skip rooms).
 */
export function pokeWorker() {
  const { reducedMotion, station } = store.getState();
  if (walkingTo >= 0 && performance.now() < walkUntil && Math.abs(view.s - walkingTo) > 0.1) return;
  const next = Math.min(Math.max(station, Math.round(view.s)) + 1, LAST_STATION);
  say(pick(lines.poke), 1);
  walkingTo = next === Math.round(view.s) ? -1 : next;
  walkUntil = performance.now() + 4000; // the hop, the 2.4 s walk, and some slack
  if (!reducedMotion && !w.act) {
    startAct("hop");
    w.pendingNext = true;
    return;
  }
  if (walkingTo >= 0) scrollToStation(walkingTo);
}

/** Clamp a heading so the flat puppet never goes edge-on to the camera (design.md §8). */
function clampYaw(yaw: number) {
  const lim = W.yawClampDeg * DEG;
  return Math.abs(yaw) <= Math.PI / 2 ? clamp(yaw, -lim, lim) : yaw > 0 ? clamp(yaw, Math.PI - lim, Math.PI) : clamp(yaw, -Math.PI, -Math.PI + lim);
}

/** A fresh order for a room's jobs, different every loop. */
function shuffle(n: number, key: string): number[] {
  const r = seeded(key);
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** The worker in the scene (design.md §8, portfolio_concept.md §4), twice the drawn size. */
export function Worker() {
  const root = useRef<Group>(null);
  const joints = useRef<Joints>(new Map());

  // entrance: he walks in from the left and stops at the desk
  useEffect(() => {
    followPoint(0, F);
    w.pos.set(F.x, 0, F.z);
    w.prev.copy(w.pos);
    const hook = ({ returning }: { returning: boolean }) => {
      w.onStage = true;
      if (store.getState().reducedMotion) return;
      if (Math.round(view.s) !== 0) {
        // you're already deeper in (a deep link, or you scrolled on while it loaded): he's waiting in
        // your room, not walking in at a desk you can't see
        followPoint(view.s, F);
        w.pos.set(F.x, 0, F.z);
        w.prev.copy(w.pos);
        return;
      }
      followPoint(0, F);
      w.entering = { t: 0, dur: returning ? 1.6 : 3.2, from: new Vector3(F.x - 18, 0, F.z - 1.5), to: new Vector3(F.x, 0, F.z), greet: !returning };
      wake(3800);
    };
    afterEntrance.push(hook);
    // a change of light gets a reaction: a stretch for the morning, a yawn for the night
    const unsub = store.subscribe((s, prev) => {
      if (s.light !== prev.light) {
        react(s.light === "morning" ? "stretch" : "yawn");
        say(pick(lines.light[s.light]), 1);
      }
      // back a room: now and then he has something to say about it
      if (s.station < prev.station && s.sceneLive && Math.random() < 0.5) setTimeout(() => say(pick(lines.back)), 900);
    });
    return () => {
      w.onStage = false;
      const i = afterEntrance.indexOf(hook);
      if (i >= 0) afterEntrance.splice(i, 1);
      unsub();
    };
  }, []);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;
    const dt = Math.min(delta, 0.1);
    const { reducedMotion, sceneLive, entranceDone } = store.getState();
    const here = Math.round(fast.s);
    const settled = Math.abs(view.s - fast.s) < 0.03 && Math.abs(fast.s - here) < 0.02;
    w.prev.copy(w.pos);

    // before his entrance he isn't on stage: hidden, parked in the camera's room, no speed (so no
    // "catching up" remarks, and no pop from the desk to the wings when the walk-in starts)
    // (deeper in, there's no walk-in to wait for: he's in your room as the box fades in around him)
    if (!w.onStage && sceneLive && Math.round(view.s) !== 0) w.onStage = true;
    g.visible = w.onStage;
    if (!w.onStage) {
      followPoint(view.s, F);
      w.pos.set(F.x, 0, F.z);
      w.prev.copy(w.pos);
      w.speed = 0;
      return;
    }

    // --- where he should be ------------------------------------------------------------
    if (reducedMotion) {
      // he stands at the current room; no walking, no jobs (design.md §10)
      w.routine = null;
      followPoint(here, F);
      w.pos.set(F.x, 0, F.z);
    } else if (w.entering) {
      const e = w.entering;
      e.t += dt;
      const k = clamp(e.t / e.dur, 0, 1);
      w.pos.lerpVectors(e.from, e.to, k);
      if (k >= 1) {
        // he says hello once he's there, not from behind whatever he's walking past
        if (e.greet) say(pick(lines.hello), 1);
        w.entering = null;
      }
    } else {
      // scrolling on drops the job: he eases back to walking ahead of you
      if (w.routine && (w.routine.station !== here || !settled)) {
        w.routine = null;
        w.act = null;
        w.face = 0;
        w.mode = "follow";
      }

      // a job starts once he's in the room and you've stopped to read
      if (!w.routine) {
        followPoint(view.s, F);
        const near = Math.hypot(w.pos.x - F.x, w.pos.z - F.z) < 0.4;
        w.settledFor = settled && near && sceneLive && entranceDone && !w.act ? w.settledFor + dt : 0;
        if (w.settledFor > 1.2 && routines[here]?.length && idleFor() < REST_S) {
          const loops = 0;
          w.routine = { station: here, order: shuffle(routines[here]!.length, `jobs:${here}:${loops}:${Math.floor(view.time)}`), job: 0, step: 0, t: 0, pauseUntil: 0, loops };
          w.mode = "job";
          w.settledFor = 0;
        }
      }

      if (w.routine) runRoutine(dt, view.time);

      if (w.mode === "follow") {
        // walk ahead of the camera: damped, so a dash of scrolling becomes a brisk catch-up, not a jump
        followPoint(view.s, F);
        w.pos.x = damp(w.pos.x, F.x, 3.2, dt);
        w.pos.z = damp(w.pos.z, F.z, 3.2, dt);
        // you scrolled off at a sprint and he had to jog to keep up
        w.rushFor = w.speed > briskV * 1.6 ? w.rushFor + dt : 0;
        if (w.rushFor > 0.35 && view.time > w.rushQuietUntil && entranceDone) {
          if (say(pick(lines.rush))) w.rushQuietUntil = view.time + 25;
        }
      } else {
        // on a job: walk to the spot at a working pace
        V.subVectors(w.target, w.pos).setY(0);
        const dist = V.length();
        if (dist > 1e-3) {
          const step = Math.min(dist, Math.min(dist * 2.4, slowV * 1.25) * dt);
          w.pos.addScaledVector(V.normalize(), step);
        }
      }
    }

    // --- speed and heading from real motion ---------------------------------------------
    V.subVectors(w.pos, w.prev).setY(0);
    const inst = V.length() / Math.max(dt, 1e-3);
    w.speed = damp(w.speed, inst, 10, dt);
    if (V.lengthSq() > 1e-6) D.copy(V).normalize();
    const moved = w.speed > 0.02;

    // --- gait from speed; cadence caps at brisk (any faster and he's slid) ----------------
    const v = w.speed;
    w.walking = damp(w.walking, v > 0.15 ? 1 : 0, 6, dt);
    let p: Pose = rest;
    if (v > 0.02 || w.walking > 0.02) {
      const blend = clamp((v - slowV) / (briskV - slowV), 0, 1);
      const cycle = W.slow.cycle + (W.brisk.cycle - W.slow.cycle) * blend;
      const rate = Math.min(v / (cycleDistance(blend < 0.5 ? W.slow : W.brisk) * S), 1 / W.brisk.cycle);
      w.phase += Math.max(rate, w.walking > 0.02 ? 0.25 / cycle : 0) * dt;
      pose(w.phase, W.slow, SLOW);
      pose(w.phase, W.brisk, BRISK);
      p = mix(rest, mix(SLOW, BRISK, blend, BODY), w.walking, BODY);
    } else {
      w.phase = Math.round(w.phase * 2 - 0.5) / 2 + 0.25;
      if (w.arrivedAt !== here && sceneLive && !reducedMotion && settled) {
        w.arrivedAt = here;
        w.hat.v += 5; // the arrival beat: a tip of the hard hat
      }
    }

    // --- jobs and reactions, blended over the body -----------------------------------
    if (w.act) {
      w.act.t += dt;
      w.last = w.act;
      if (w.act.t >= w.act.dur) {
        const done = w.act.name;
        w.act = null;
        if (w.pendingNext && done === "hop") {
          w.pendingNext = false;
          if (walkingTo >= 0) scrollToStation(walkingTo);
        }
      }
    }
    activity.valve = w.act?.name === "valve";
    w.actW = damp(w.actW, w.act ? 1 : 0, 7, dt);
    let o: Overlay = NONE;
    if (w.last && w.actW > 0.002) {
      o = action(w.last.name, w.last.t);
      p = overlay(p, o, w.actW, BODY);
    }

    // --- facing -----------------------------------------------------------------------
    let yaw: number;
    if (w.face !== 0 && w.speed < 0.3) yaw = w.face > 0 ? 0 : Math.PI;
    else yaw = clampYaw(Math.atan2(-D.z, D.x));
    let d = yaw - w.yaw;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    w.yaw += d * (1 - Math.exp(-dt / (W.turnTime / 4)));

    // --- idle fidgets between jobs (one every 4–7 s) ---------------------------------------
    const busy = !!w.act || (w.routine !== null && view.time >= w.routine.pauseUntil);
    if (!reducedMotion && w.walking < 0.05 && sceneLive && !busy) {
      w.nextFidget -= dt;
      if (w.nextFidget <= 0) {
        const rng = seeded(`fidget:${Math.floor(view.time)}`);
        const pick = rng();
        if (pick < 0.25) w.hat.v += 3;
        else if (pick < 0.5) w.headTarget = 12 * DEG;
        else if (pick < 0.7) w.clipTarget = -35 * DEG;
        else if (pick < 0.85) react("scratch", true);
        else react("lookUp", true);
        w.nextFidget = W.fidget[0] + (W.fidget[1] - W.fidget[0]) * rng();
        setTimeout(() => ((w.headTarget = 0), (w.clipTarget = 0), nudge(1200)), 1300);
        nudge(1500);
      }
    }
    w.head = damp(w.head, w.headTarget, 5, dt);
    w.clip = damp(w.clip, w.clipTarget, 5, dt);
    stepSpring(w.hat, 0, dt);
    const idleMoving = springActive(w.hat, 0) || Math.abs(w.head - w.headTarget) > 1e-3 || Math.abs(w.clip - w.clipTarget) > 1e-3;

    // --- apply ---------------------------------------------------------------------------
    g.position.set(w.pos.x, 0, w.pos.z);
    g.rotation.y = w.yaw;
    EXTRA.head = w.head + (o.head ?? 0) * w.actW;
    EXTRA.clip = w.clip * (1 - w.actW);
    EXTRA.hat = Math.max(0, w.hat.x) * 0.12;
    EXTRA.lift = (o.lift ?? 0) * w.actW;
    applyPose(joints.current, p, EXTRA);

    const acting = w.actW > 0.002;
    if (moved || w.walking > 0.02 || (acting && !w.last?.idle) || Math.abs(d) > 0.01) {
      shadows.dirty = true;
      wake(150);
    } else if (idleMoving || acting) {
      // a fidget: its shadow follows on the ambient frames
      shadows.dirty = true;
      nudge(150);
    }

    // --- where he is on screen, for the HTML button (≤ 30 Hz) -----------------------------
    if (Math.floor(state.clock.elapsedTime * 30) !== Math.floor((state.clock.elapsedTime - dt) * 30)) {
      HEAD.set(0, 2.8, 0).applyMatrix4(g.matrixWorld).project(state.camera);
      w.screen.on = HEAD.z < 1 && Math.abs(HEAD.x) < 1 && Math.abs(HEAD.y) < 1;
      w.screen.x = (HEAD.x * 0.5 + 0.5) * state.size.width;
      w.screen.y = (-HEAD.y * 0.5 + 0.5) * state.size.height;
      const btn = handle;
      if (btn) {
        btn.style.translate = `${w.screen.x.toFixed(0)}px ${w.screen.y.toFixed(0)}px`;
        // keep his speech bubble on screen; its tail still points at him
        const half = Math.min(130, state.size.width / 2 - 20);
        btn.style.setProperty("--shift", `${(clamp(w.screen.x, half + 14, state.size.width - half - 14) - w.screen.x).toFixed(0)}px`);
        if (w.screen.on && sceneLive) btn.dataset.on = "";
        else delete btn.dataset.on;
      }
    }
  });

  return (
    <group ref={root} rotation-y={50 * DEG} scale={S}>
      <WorkerRig joints={joints} />
    </group>
  );
}

/** Step through the room's jobs in this loop's order; a breather; then a new order. */
function runRoutine(dt: number, now: number) {
  const r = w.routine!;
  if (now < r.pauseUntil) return;
  const jobs = routines[r.station] ?? [];
  const job = jobs[r.order[r.job] ?? -1];
  if (!job) {
    r.loops++;
    r.order = shuffle(jobs.length, `jobs:${r.station}:${r.loops}`);
    r.job = 0;
    r.step = 0;
    r.pauseUntil = now + 4 + 3 * seeded(`pause:${r.station}:${r.loops}`)();
    w.face = 0;
    return;
  }
  const step = job[r.step];
  const next = () => {
    r.step++;
    r.t = 0;
    if (r.step >= job.length) {
      r.step = 0;
      r.job++;
      if (idleFor() > REST_S) {
        // nobody's watching: he steps back to his spot and waits
        w.routine = null;
        w.face = 0;
        w.mode = "follow";
      }
    }
  };
  if (!step) return next();
  if ("go" in step) {
    w.face = 0;
    w.target.set(step.go[0], 0, -box.length * r.station + step.go[1]);
    if (Math.hypot(w.target.x - w.pos.x, w.target.z - w.pos.z) < 0.08) next();
  } else if ("face" in step) {
    w.face = step.face;
    next();
  } else if ("act" in step) {
    if (!w.act && r.t === 0) {
      startAct(step.act, step.for ?? DURATION[step.act]);
      const said = lines.acts[step.act];
      if (said && Math.random() < 0.4) say(pick(said));
    }
    r.t += dt;
    if (!w.act && r.t > 0.05) next();
  } else {
    r.t += dt;
    if (r.t >= step.wait) next();
  }
}

/**
 * The HTML handle (architecture.md §6.9): a real button over him, keyboard and screen-reader friendly.
 * He talks from here too: a line on hover, and now and then one of his own (lines.ts).
 */
export function WorkerLayer() {
  const btn = useRef<HTMLButtonElement>(null);
  const bindHandle = (el: HTMLButtonElement | null) => {
    btn.current = el;
    handle = el;
  };

  // chatter: every 11–20 s, if he's on screen and you're looking, a line for the room he's in
  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const { sceneLive, curtainOpen, station } = store.getState();
      const ready = !document.hidden && sceneLive && curtainOpen && btn.current?.dataset.on !== undefined;
      const spoke = ready && say(pick(Math.random() < 0.7 ? (lines.rooms[station] ?? lines.idle) : lines.idle));
      timer = window.setTimeout(tick, spoke ? 11000 + Math.random() * 9000 : 4000);
    };
    timer = window.setTimeout(tick, 9000);
    return () => clearTimeout(timer);
  }, []);

  const hello = () => {
    react("wave");
    say(pick(lines.hover), 1);
  };

  return (
    <button
      ref={bindHandle}
      type="button"
      data-worker
      className={styles.button}
      onClick={pokeWorker}
      onPointerEnter={hello}
      onFocus={hello}
      aria-label="Walk to the next station"
    >
      <span ref={bindBubble} className={styles.bubble} aria-hidden />
    </button>
  );
}
