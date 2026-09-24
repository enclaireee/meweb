"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { stationNumber, stations, LAST_STATION } from "@/sections/stations";
import { useScene } from "@/scene/store";
import { TiltToggle } from "@/scene/input/TiltToggle";
import { items } from "@/ui/SiteNav/SiteNav";
import { PHONE } from "./phone";
import type { DeckApi } from "./wiring";
import styles from "./Deck.module.css";

/**
 * The phone chrome (mobile_concept.md §3): the program (the site nav), the storyteller on the stage's
 * lip, and the clappers along the bottom (a punch per room, and the way back and on).
 * Hidden from 640px up. Everything is a plain link, so it all works before (and without) JS; the
 * wiring in ./wiring is only fetched on phones.
 */
export function Deck({ puppet }: { puppet: ReactNode }) {
  const station = useScene((s) => s.station);
  const api = useRef<DeckApi | null>(null);
  const program = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!matchMedia(PHONE).matches) return;
    let gone = false;
    import("./wiring").then(({ startDeck }) => {
      if (!gone) api.current = startDeck();
    });
    return () => {
      gone = true;
      api.current?.stop();
      api.current = null;
    };
  }, []);

  const onTilt = useCallback((x: number, y: number) => api.current?.tilt(x, y), []);
  const prev = stations[Math.max(0, station - 1)]!;
  const next = stations[Math.min(LAST_STATION, station + 1)]!;

  return (
    <div className={styles.deck}>
      <button type="button" className={`cast ${styles.programButton}`} popoverTarget="program">
        <span className={`${styles.tab} paper grain text-caption italic`}>Program</span>
      </button>
      <nav id="program" ref={program} popover="auto" aria-label="Sections" className={`${styles.program} paper grain`}>
        <p className="text-kicker uppercase text-ink-soft">Tonight&rsquo;s program</p>
        <ol>
          {items.map((it) => (
            <li key={it.label}>
              <a href={it.href} aria-current={it.on.includes(station) ? "location" : undefined} onClick={() => program.current?.hidePopover()}>
                {it.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className={styles.teller} data-teller>
        <button type="button" className={styles.puppetButton} aria-label="The worker. Tap for a word" onClick={() => api.current?.poke()}>
          {puppet}
        </button>
        <p className={styles.bubble} data-bubble aria-live="polite" />
      </div>

      <nav aria-label="Rooms" className={`cast ${styles.clappers}`}>
        <div className={`${styles.strip} paper grain`}>
          <a href={`#${prev.slug}`} className={styles.step} aria-label="Previous room" aria-disabled={station === 0 || undefined}>
            ‹
          </a>
          <ol className={styles.punches}>
            {stations.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.slug}`} className={styles.punch} aria-current={i === station ? "step" : undefined}>
                  <span className="visually-hidden">
                    {stationNumber(i)} {s.label}
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <a href={`#${next.slug}`} className={styles.step} aria-label="Next room" aria-disabled={station === LAST_STATION || undefined}>
            ›
          </a>
        </div>
      </nav>

      <TiltToggle onTilt={onTilt} />
    </div>
  );
}
