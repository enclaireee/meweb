"use client";

import { useEffect } from "react";
import { store } from "@/scene/store";
import type { LightMode } from "@/design/tokens";

/**
 * Tiny always-on client wiring (initial bundle): the current station from the viewport centre,
 * the light state from <html>, and the reduced-motion preference. No animation loop here.
 */
export function ClientBoot() {
  useEffect(() => {
    const html = document.documentElement;
    store.setState({ light: (html.dataset.light as LightMode) ?? "night" });

    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => store.setState({ reducedMotion: mq.matches });
    syncMotion();
    mq.addEventListener("change", syncMotion);

    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-station]"));
    let first = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.dataset.active = "";
            store.setState({ station: Number(el.dataset.station) });
          } else {
            delete el.dataset.active;
          }
        }
        // only now may off-screen plates wait to fade in: the one already on screen is never hidden
        // (hiding it until hydration would push LCP to whenever JS finishes)
        if (first) {
          first = false;
          html.dataset.stations = "live";
        }
      },
      // a line across the viewport centre: exactly one section crosses it
      { rootMargin: "-49.9% 0px -49.9% 0px" },
    );
    sections.forEach((s) => io.observe(s));

    return () => {
      io.disconnect();
      mq.removeEventListener("change", syncMotion);
      delete html.dataset.stations;
    };
  }, []);

  return null;
}
