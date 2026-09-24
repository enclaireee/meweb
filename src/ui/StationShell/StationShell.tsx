import type { CSSProperties, ReactNode } from "react";
import { stations } from "@/sections/stations";
import styles from "./StationShell.module.css";

/** Tilt weight of each baked band, back (the haze) to front (the arch) (mobile_concept.md §4.2). */
const weights = [0.05, 0.2, 0.45, 0.7, 1];

/**
 * One <section> per station (design.md §3): it gives the scroll its length and the anchor its target.
 * Its cards live in a layer fixed over the scene: only the active room's cards are lowered in
 * (ui/Hang). Without JS the layer is just the section's content, in order.
 *
 * On phones (mobile_concept.md) the same section drives the layered dolly instead: its stage (the
 * room's five baked bands) is fixed to the top half and its layer is the card panel in the bottom
 * half. The bands are lazy and only displayed near the camera, so desktop never fetches one.
 */
export function StationShell({ index, labelledBy, children }: { index: number; labelledBy: string; children: ReactNode }) {
  const station = stations[index]!;
  return (
    <section
      id={station.slug}
      aria-labelledby={labelledBy}
      data-station={index}
      className={styles.station}
      style={{ "--station": index } as CSSProperties}
    >
      <div className={styles.stage} aria-hidden>
        {weights.map((w, b) => (
          <div key={b} className={styles.band} style={{ "--w": w, "--b": b } as CSSProperties}>
            <div className={styles.sheet}>
              {(["night", "morning"] as const).map((light) => (
                // baked stills, already sized for the stage: next/image would add nothing but JS
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={light}
                  className={styles[light]}
                  src={`/rooms/${station.slug}-${light}-b${b}.avif`}
                  alt=""
                  width={800}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.layer}>{children}</div>
    </section>
  );
}
