"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { store, useScene } from "./store";
import { initialTier } from "./quality/tier";

// the whole 3D chunk (three, R3F, GSAP, Lenis): never in the initial bundle (architecture.md §2.3)
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** Decides whether the scene may load at all, then waits for load + idle before fetching it (§2.2). */
export function SceneMount() {
  const tier = useScene((s) => s.tier);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const t = initialTier();
    store.setState({ tier: t });
    if (t === "none") return;
    // after the page has fully loaded and the main thread is idle: the readable page never waits on it
    let idle = 0;
    const start = () => {
      const ric = window.requestIdleCallback;
      idle = ric ? ric(() => setGo(true), { timeout: 3000 }) : window.setTimeout(() => setGo(true), 1200);
    };
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
    return () => {
      removeEventListener("load", start);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);

  if (!go || tier === "none") return null;
  return <Scene />;
}
