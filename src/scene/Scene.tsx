"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { camera as cam } from "@/design/tokens";
import { clamp } from "@/lib/math";
import { advanceLoading, fast, store, useScene } from "./store";
import { noteInput, setAmbient, startLoop, wake } from "./loop";
import { dprFor, stepDown } from "./quality/tier";
import { CameraRig, view } from "./camera/rig";
import { stationCoord } from "./camera/path";
import { Lights } from "./light/Lights";
import { Floor } from "./paper/Floor";
import { glowMaterial, paperMaterial } from "./paper/material";
import { Stations } from "./Stations";
import { Worker, WorkerLayer, w as worker } from "./worker/Worker";
import { TiltToggle } from "./input/TiltToggle";
import { killEntrance, prepareEntrance, runEntrance } from "./entrance";
import styles from "./Scene.module.css";

/** `?debug`: draw calls, triangles and GPU memory every 2 s (architecture.md §9), no tooling shipped. */
function DebugInfo() {
  const last = useRef(0);
  // the live numbers, for poking at from the console or a test (scroll ↔ camera ↔ worker sync)
  useEffect(() => {
    (window as unknown as { __nw: unknown }).__nw = { view, fast, worker };
  }, []);
  useFrame(({ gl, clock }) => {
    if (clock.elapsedTime - last.current < 2) return;
    last.current = clock.elapsedTime;
    const { render, memory } = gl.info;
    console.info("[workshop]", { calls: render.calls, triangles: render.triangles, geometries: memory.geometries, textures: memory.textures, tier: store.getState().tier, dpr: gl.getPixelRatio() });
  });
  return null;
}

/**
 * The 3D workshop (architecture.md §2, §6). Lazy-loaded; everything readable is already HTML.
 * The canvas sits behind the page, aria-hidden; the scene only listens to the document.
 */
export default function Scene() {
  const tier = useScene((s) => s.tier);
  const wrap = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const pending = useRef<(() => void) | null>(null);
  // client-only chunk (ssr: false), so reading the URL once at mount is safe
  const [debug] = useState(() => location.search.includes("debug"));

  useEffect(() => {
    advanceLoading(0.6);
    const smooth = !store.getState().reducedMotion;
    const loop = startLoop({ smooth, onSlow: () => store.setState((s) => ({ tier: stepDown(s.tier) })) });
    // ambient life (drift, sway, fidgets) renders at half rate, and not at all on the low tier or under
    // reduced motion (design.md §10)
    const ambient = () => {
      const { reducedMotion, tier } = store.getState();
      setAmbient(!reducedMotion && tier !== "low");
    };
    ambient();
    const unsub = store.subscribe(ambient);

    // scroll → station coordinate, one trigger per station section (design.md §3 dwell zones)
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-station]"));
    const triggers = sections.map((el) => {
      const i = Number(el.dataset.station);
      const update = (self: ScrollTrigger) => {
        if (self.isActive) fast.s = stationCoord(i, self.progress);
        else if (i === 0 && self.progress === 0) fast.s = 0;
        else if (i === sections.length - 1 && self.progress === 1) fast.s = i;
      };
      return ScrollTrigger.create({ trigger: el, start: "top center", end: "bottom center", onUpdate: update, onRefresh: update });
    });
    ScrollTrigger.refresh();

    // pointer (desktop), horizontal drag (touch)
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      fast.pointerX = (e.clientX / innerWidth) * 2 - 1;
      fast.pointerY = -((e.clientY / innerHeight) * 2 - 1);
      noteInput();
      // one frame to start: the rig keeps itself awake until the aim has caught up
      wake(150);
    };
    let touchX = 0;
    let touchY = 0;
    let horizontal: boolean | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0]!.clientX;
      touchY = e.touches[0]!.clientY;
      horizontal = null;
      noteInput();
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0]!.clientX - touchX;
      const dy = e.touches[0]!.clientY - touchY;
      if (horizontal === null && Math.hypot(dx, dy) > 8) horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal) {
        fast.dragX = clamp(dx / (innerWidth * 0.4), -1, 1);
        wake(150);
      }
    };
    const onTouchEnd = () => {
      fast.dragX = 0; // the box settles back to its front view (concept.md §4)
      wake(150);
    };
    const onKey = () => noteInput();
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: true });
    addEventListener("touchend", onTouchEnd, { passive: true });
    addEventListener("keydown", onKey, { passive: true });

    return () => {
      unsub();
      loop.stop();
      triggers.forEach((t) => t.kill());
      removeEventListener("pointermove", onPointer);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchend", onTouchEnd);
      removeEventListener("keydown", onKey);
      pending.current?.();
      killEntrance();
      delete document.documentElement.dataset.scene;
      store.setState({ sceneLive: false, entranceDone: false });
    };
  }, []);

  // first station built: one frame behind the curtain, then 100%; the entrance waits for the curtain
  const onFirstStation = useCallback(() => {
    if (started.current) return;
    started.current = true;
    prepareEntrance();
    advanceLoading(0.92);
    wake(500);
    // (every step is cancellable: the scene can unmount mid-load if the tier falls to none)
    let timer = window.setTimeout(() => {
      advanceLoading(1);
      const go = () => {
        timer = window.setTimeout(runEntrance, 180);
      };
      if (store.getState().curtainOpen) go();
      else {
        const unsub = store.subscribe((s) => {
          if (s.curtainOpen) {
            unsub();
            go();
          }
        });
        pending.current = () => (unsub(), clearTimeout(timer));
        return;
      }
    }, 120);
    pending.current = () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div ref={wrap} className={styles.canvas} data-canvas aria-hidden>
      <Canvas
        flat
        shadows="percentage"
        dpr={dprFor(tier)}
        frameloop="never"
        gl={{ antialias: true, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: cam.fovLandscape, near: cam.near, far: cam.far, position: [0, cam.restY, cam.restDistance] }}
        onCreated={({ gl }) => {
          advanceLoading(0.72);
          paperMaterial();
          glowMaterial();
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            store.setState({ tier: "none" });
          });
        }}
      >
        {debug && <DebugInfo />}
        <Lights />
        <CameraRig>
          <Floor />
          <Stations onFirstStation={onFirstStation} />
          <Worker />
        </CameraRig>
      </Canvas>
      </div>
      {/* at the end of <body>: the worker comes after the plates in the tab order (design.md §10);
          where they paint is set by their own z-index, not by DOM order */}
      {createPortal(
        <>
          <WorkerLayer />
          <TiltToggle />
        </>,
        document.body,
      )}
    </>
  );
}
