"use client";

import { useEffect } from "react";
import { useFrame, useThree, type RootState } from "@react-three/fiber";
import gsap from "gsap";
import { Color, DirectionalLight, Fog, HemisphereLight, Object3D, SpotLight, Vector3 } from "three";
import { light as L, fog as F, ui, type LightMode } from "@/design/tokens";
import { DEG, smoothstep } from "@/lib/math";
import { store, type Tier } from "@/scene/store";
import { wake } from "@/scene/loop";
import { view } from "@/scene/camera/rig";
import { archZ } from "@/scene/camera/path";
import { glowUniform, relightUniform } from "@/scene/paper/material";
import { shadows } from "./shadows";

/** Relight progress (0 night → 1 morning) and the lamp's flicker scale (entrance). */
export const lightState = { p: 0, glow: 1, lampScale: 1 };

// ponytail: intensities tuned by eye on screenshots so front-facing stock reads close to its token.
const SPOT_INTENSITY = 560;
const SUN_INTENSITY = 3.4;
const HEMI = { night: 2.3, morning: 1.15 };

const mapSize = (tier: Tier) => (tier === "high" ? L.shadow.mapSize : L.shadow.mapSizeLow);

const nightFog = new Color(ui.night.fog);
const dayFog = new Color(ui.morning.fog);
const hemiSkyN = new Color(L.hemi.night.sky);
const hemiSkyM = new Color(L.hemi.morning.sky);
const hemiGroundN = new Color(L.hemi.night.ground);
const hemiGroundM = new Color(L.hemi.morning.ground);
const sunDir = new Vector3(...L.sun.direction).normalize();
const yAxis = new Vector3(0, 1, 0);
const tmp = new Vector3();

/** The lighting rig is app-lifetime, like the materials: made once, mutated every frame. */
let rig: ReturnType<typeof makeRig> | null = null;
function makeRig() {
  const spot = new SpotLight(L.spot.color, SPOT_INTENSITY, 0, L.spot.angleDeg * DEG, L.spot.penumbra, L.spot.decay);
  spot.castShadow = true;
  spot.shadow.bias = L.shadow.bias;
  spot.shadow.normalBias = L.shadow.normalBias;
  spot.shadow.radius = L.shadow.radius;
  spot.shadow.camera.near = 4;
  spot.shadow.camera.far = 160;
  const target = new Object3D();
  spot.target = target;

  const sun = new DirectionalLight(L.sun.color, 0);
  sun.castShadow = false;
  sun.shadow.bias = L.shadow.bias;
  sun.shadow.normalBias = L.shadow.normalBias;
  sun.shadow.radius = L.shadow.radius;
  const sc = sun.shadow.camera;
  sc.left = -48;
  sc.right = 48;
  sc.top = 44;
  sc.bottom = -8;
  sc.near = 1;
  sc.far = 220;
  const sunTarget = new Object3D();
  sun.target = sunTarget;

  const hemi = new HemisphereLight(L.hemi.night.sky, L.hemi.night.ground, HEMI.night);
  const fog = new Fog(ui.night.fog, F.near, F.far);
  return { spot, target, sun, sunTarget, hemi, fog };
}
const lights = () => (rig ??= makeRig());

function applyTier(tier: Tier) {
  const { spot, sun } = lights();
  const s = mapSize(tier);
  for (const l of [spot, sun]) {
    if (l.shadow.mapSize.x !== s) {
      l.shadow.mapSize.set(s, s);
      l.shadow.map?.dispose();
      l.shadow.map = null;
    }
  }
  shadows.dirty = true;
}

/** The relight roll: one tween on one uniform, small lights last (design.md §7.2). */
function relightTo(mode: LightMode, instant: boolean) {
  const p = mode === "morning" ? 1 : 0;
  const reduced = store.getState().reducedMotion;
  gsap.killTweensOf(lightState, "p,glow");
  if (instant) {
    lightState.p = p;
    lightState.glow = 1 - p;
    wake(200);
    return;
  }
  const dur = reduced ? 0.4 : 3;
  gsap.to(lightState, { p, duration: dur, ease: "none", onUpdate: () => wake(120) });
  gsap.to(lightState, { glow: 1 - p, duration: reduced ? 0.4 : 0.6, delay: reduced ? 0 : dur + 0.3, ease: "power1.inOut", onUpdate: () => wake(120) });
}

/** Per frame: aim the lamp, place the sun, blend the fill and the fog. */
function updateLights(camera: { position: Vector3 }) {
  const { spot, target, sun, sunTarget, hemi, fog } = lights();
  const p = lightState.p;
  relightUniform.value = p;
  glowUniform.value = lightState.glow;
  const k = smoothstep(0.25, 0.75, p);

  // the lamp rides the camera rig, aimed at the pointer's spot on the stage plane
  spot.position.set(camera.position.x + L.spot.offset[0], camera.position.y + L.spot.offset[1], camera.position.z + L.spot.offset[2]);
  target.position.set(view.aimX * 18, 9 + view.aimY * 8, archZ(view.s) - 26);
  target.updateMatrixWorld();
  spot.intensity = SPOT_INTENSITY * (1 - k) * lightState.lampScale;

  // daylight from the upper left, the pointer nudging it ±5°
  const stageZ = archZ(view.s) - 22;
  sunTarget.position.set(0, 10, stageZ);
  sunTarget.updateMatrixWorld();
  tmp.copy(sunDir).applyAxisAngle(yAxis, view.aimX * L.sun.nudgeDeg * DEG);
  sun.position.set(-tmp.x * 90, 10 - tmp.y * 90, stageZ - tmp.z * 90);
  sun.intensity = SUN_INTENSITY * k;

  const nightKey = k < 0.5;
  if (spot.castShadow !== nightKey) {
    spot.castShadow = nightKey;
    sun.castShadow = !nightKey;
    shadows.dirty = true;
  }

  hemi.color.lerpColors(hemiSkyN, hemiSkyM, p);
  hemi.groundColor.lerpColors(hemiGroundN, hemiGroundM, p);
  hemi.intensity = HEMI.night + (HEMI.morning - HEMI.night) * p;
  fog.color.lerpColors(nightFog, dayFog, p);
}

/** Fog, background and manual shadow updates live on the scene and renderer (outside React). */
function attach(get: () => RootState) {
  const { scene, gl } = get();
  const { fog } = lights();
  scene.fog = fog;
  scene.background = fog.color;
  gl.shadowMap.autoUpdate = false;
  return () => {
    scene.fog = null;
    scene.background = null;
  };
}

function flushShadows(gl: { shadowMap: { needsUpdate: boolean } }) {
  if (!shadows.dirty) return;
  gl.shadowMap.needsUpdate = true;
  shadows.dirty = false;
}

/**
 * One key light at a time (architecture.md §6.5). Night: a warm work-lamp on the camera rig, aimed by
 * the pointer. Morning: daylight from the upper left. Only the active one casts shadows.
 */
export function Lights() {
  const get = useThree((s) => s.get);

  // the far end of the box fades into the pale haze (design.md §5.3)
  useEffect(() => attach(get), [get]);

  useEffect(() => {
    applyTier(store.getState().tier);
    return store.subscribe((s, prev) => s.tier !== prev.tier && applyTier(s.tier));
  }, []);

  useEffect(() => {
    relightTo(store.getState().light, true);
    return store.subscribe((s, prev) => s.light !== prev.light && relightTo(s.light, false));
  }, []);

  useFrame((state) => updateLights(state.camera), -5);

  // re-render the shadow map only on frames where something moved (§6.5)
  useFrame((state) => flushShadows(state.gl), -1);

  const { spot, target, sun, sunTarget, hemi } = lights();
  return (
    <>
      <primitive object={spot} />
      <primitive object={target} />
      <primitive object={sun} />
      <primitive object={sunTarget} />
      <primitive object={hemi} />
    </>
  );
}
