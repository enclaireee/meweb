// Ambient life for the stop you're at: mist, leaves, shooting stars, birds, water glints.
// (The lighthouse beam is the pier's, in Notes: it comes to rest on the hero board.)
// Placed in screen units u (art units right of the traveller anchor at rest, art/stops/shared-b.ts), on the camera plane.
// CSS only; nothing re-renders per frame. Fades out while gliding, off under reduced motion.
import { memo, type CSSProperties } from "react";
import s from "./river.module.css";

type Fx = "mist" | "leaves" | "stars" | "birds";
// ponytail: hand-picked per stop from the art; add a dial if a stop's art changes.
const LIFE: Fx[][] = [["mist", "birds"], ["mist"], ["birds"], ["birds"]]; // Spring, Market pier, Village, Lighthouse

const hash = (...n: number[]) => {
  let h = 2166136261;
  for (const v of n) h = Math.imul(h ^ v, 16777619);
  return ((h >>> 0) % 10007) / 10007;
};

const at = (u: number, y: number, extra?: Record<string, string | number>) => ({ "--u": u, "--y": y, ...extra }) as CSSProperties;

function Life({ fx, stop, phone }: { fx: Fx; stop: number; phone: boolean }) {
  const r = (j: number, k: number) => hash(stop, j, k, fx.length);
  const span = phone ? [-150, 290] : [-560, 1320];
  const u = (j: number) => span[0]! + r(j, 1) * (span[1]! - span[0]!);
  switch (fx) {
    case "mist":
      return (
        <>
          {[0, 1].map((j) => (
            <i key={j} className={s.mist} style={at(u(j) - 300, 380 + j * 90, { animationDelay: `${-r(j, 2) * 30}s` })} />
          ))}
        </>
      );
    case "leaves":
      return (
        <>
          {Array.from({ length: phone ? 4 : 8 }, (_, j) => (
            <i key={j} className={s.leaf} style={at(u(j), -40, { animationDelay: `${-r(j, 2) * 9}s`, animationDuration: `${7 + r(j, 3) * 5}s` })} />
          ))}
        </>
      );
    case "stars":
      return (
        <>
          {[0, 1].map((j) => (
            <i key={j} className={s.star} style={at(span[0]! + (0.35 + j * 0.3) * (span[1]! - span[0]!), 60 + j * 70, { animationDelay: `${2 + j * 5.5}s` })} />
          ))}
        </>
      );
    case "birds":
      return (
        <>
          {Array.from({ length: 3 }, (_, j) => (
            <svg key={j} className={s.bird} viewBox="0 0 24 10" style={at(span[0]! - 60, 120 + r(j, 2) * 140, { animationDelay: `${3 + j * 0.7 + r(j, 3) * 2}s` })}>
              <path d="M1 7 Q6 1 12 7 Q18 1 23 7" />
            </svg>
          ))}
        </>
      );
  }
}

export const Ambient = memo(function Ambient({ stop, on, phone }: { stop: number; on: boolean; phone: boolean }) {
  const glints = phone ? 6 : 14;
  const span = phone ? [-150, 290] : [-560, 1320];
  // No key on the group: it stays mounted, so arriving does not re-run its fade or rebuild its layer set. Its
  // children do change with the stop (new hashes), reusing the same nodes.
  return (
    <div className={s.ambient} data-on={on}>
      {LIFE[stop]!.map((fx) => (
        <Life key={fx} fx={fx} stop={stop} phone={phone} />
      ))}
      {Array.from({ length: glints }, (_, j) => (
        <i
          key={j}
          className={s.glint}
          style={at(span[0]! + hash(stop, j, 9) * (span[1]! - span[0]!), 590 + hash(stop, j, 10) * 150, {
            animationDelay: `${-hash(stop, j, 11) * 4}s`,
            animationDuration: `${2.6 + hash(stop, j, 12) * 2.4}s`,
          })}
        />
      ))}
    </div>
  );
});

export default Ambient;
