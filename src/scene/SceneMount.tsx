"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { advanceLoading, store, useScene } from "./store";
import { initialTier } from "./quality/tier";
import { PHONE } from "@/ui/Deck/phone";

// the whole 3D chunk (three, R3F, GSAP, Lenis): never in the initial bundle (architecture.md §2.3)
const Scene = dynamic(() => import("./Scene"), { ssr: false });

/**
 * Decides whether the scene may load at all, then fetches it while the loading curtain is down (§2.2;
 * the page underneath is complete HTML regardless).
 */
export function SceneMount() {
  const tier = useScene((s) => s.tier);
  const [go, setGo] = useState(false);

  useEffect(() => {
    // phones get the paper theatre instead (ui/Deck, mobile_concept.md): the 3D never downloads,
    // except to bake the theatre's rooms (scene/bake.tsx)
    const t = matchMedia(PHONE).matches && !location.search.includes("bake") ? "none" : initialTier();
    store.setState({ tier: t });
    if (t === "none") {
      // nothing to build: the curtain can part as soon as the type is in
      document.fonts?.ready.then(() => advanceLoading(1));
      return;
    }
    // the loading screen is up, so start straight away: every millisecond now is time spent waiting
    advanceLoading(0.4);
    queueMicrotask(() => setGo(true));
  }, []);

  // a tier can fall to none mid-load (context lost, too slow): don't leave the curtain down
  useEffect(() => {
    if (tier === "none") advanceLoading(1);
  }, [tier]);

  if (!go || tier === "none") return null;
  return <Scene />;
}
