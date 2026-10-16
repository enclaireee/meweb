"use client";
// The layered world: art tiles per layer, fireflies at three depths and the traveller, in draw order (layers.md).
// Nothing here re-renders per frame: movement is CSS reading --pos/--px/--py from the stage.
// Every tile and firefly stays mounted for the whole visit: any DOM change inside a layer makes the compositor
// re-raster it at the current camera scale, and the layer blanks for a frame (the flicker).
import { memo, type CSSProperties, type RefCallback, type RefObject } from "react";
import manifest from "../../../public/art/desktop/manifest.json";
import { dials, stops } from "@/content/site";
import type { Layout } from "@/lib/layout";
import { Ambient } from "./Ambient";
import { TRAVELLER_SVG } from "./traveller.generated";
import s from "./river.module.css";
import i from "./intro.module.css";

/** Total reveal time (ms): the staggered rise. River flips intro to "done" after this. */
export const INTRO_MS = 2000; // last layer: ~22 × 48 ms stagger + 900 ms rise

type Intro = "wait" | "play" | "done";

type LayerM = { id: string; name: string; s: number; fx?: string; length: number; tiles: { f: string; x: number; w: number }[] };
const LAYERS = manifest.layers as LayerM[];

// Fireflies: depth → speed, size range (units), y band, insert after this layer id.
const FF = [
  { s: 0.45, size: [3, 4], y: [300, 600], after: "07" },
  { s: 1, size: [5, 7], y: [260, 640], after: "w2" },
  { s: 1.8, size: [9, 12], y: [160, 900], after: "11" },
] as const;

/** Deterministic pseudo-random in [0, 1) from integers. */
const hash = (...n: number[]) => {
  let h = 2166136261;
  for (const v of n) h = Math.imul(h ^ v, 16777619);
  return ((h >>> 0) % 10007) / 10007;
};

const ALL = stops.map((st) => st.i);

function Fireflies({ depth, active, phone, ri }: { depth: 0 | 1 | 2; active: number; phone: boolean; ri: number }) {
  const d = FF[depth];
  return (
    <div className={`${s.layer} ${i.rise}`} style={{ "--s": d.s, "--ri": ri } as CSSProperties}>
      {ALL.map((stIdx) => {
        const n = Math.ceil(dials[stIdx]!.ff[depth] / (phone ? 2 : 1));
        return (
          <div key={stIdx} className={s.ffSet} data-on={stIdx === active}>
            {Array.from({ length: n }, (_, j) => {
              const x = 1200 + d.s * stIdx * 1700 + (hash(stIdx, j, depth, 1) * 1900 - 600) * Math.max(1, d.s * 0.8);
              const y = d.y[0] + hash(stIdx, j, depth, 2) * (d.y[1] - d.y[0]);
              const size = d.size[0] + hash(stIdx, j, depth, 3) * (d.size[1] - d.size[0]);
              const style = {
                "--x": x,
                "--y": y,
                "--size": size,
                animationDelay: `${-hash(stIdx, j, 4) * 9}s, ${-hash(stIdx, j, 5) * 4}s`,
                animationDuration: `${7 + hash(stIdx, j, 6) * 5}s, ${2.5 + hash(stIdx, j, 7) * 2}s`,
              } as CSSProperties;
              return <i key={j} className={s.ff} data-depth={depth} style={style} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

type Props = {
  L: Layout;
  ffActive: number;
  travellerState: string;
  /** Collects layer elements that need per-frame fx (opacity/offset by pos). */
  fxRef: (id: string, fx: string) => RefCallback<HTMLDivElement>;
  /** The CSS sky behind layer 00; River paints it per frame. */
  skyRef: RefObject<HTMLDivElement | null>;
  /** Stop whose ambient life plays, and whether it shows (at rest only). */
  lifeStop: number;
  lifeOn: boolean;
  intro: Intro;
};

export const World = memo(function World({ L, ffActive, travellerState, fxRef, skyRef, lifeStop, lifeOn, intro }: Props) {
  const phone = L.profile === "phone";
  const out: React.ReactNode[] = [];
  const worldCls = intro === "wait" ? i.wait : intro === "play" ? i.play : "";
  let ri = 0;
  for (const layer of LAYERS) {
    out.push(
      <div
        key={layer.id}
        className={`${s.layer} ${i.rise}`}
        data-layer={layer.id}
        style={{ "--s": layer.s, "--len": layer.length, "--ri": ri++ } as CSSProperties}
        ref={layer.fx ? fxRef(layer.id, layer.fx) : undefined}>
        {layer.tiles.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element -- pre-built SVG art tiles, next/image adds nothing here
          <img key={t.f} className={s.tile} src={`/art/desktop/${t.f}`} alt="" draggable={false} style={{ "--x": t.x, "--w": t.w } as CSSProperties} />
        ))}
      </div>,
    );
    FF.forEach((d, depth) => {
      if (d.after === layer.id) out.push(<Fireflies key={`ff${depth}`} depth={depth as 0 | 1 | 2} active={ffActive} phone={phone} ri={ri++} />);
    });
    if (layer.id === "w2") {
      out.push(
        <div key="traveller" className={s.plane}>
          <div className={s.traveller} data-state={travellerState} dangerouslySetInnerHTML={{ __html: TRAVELLER_SVG }} />
        </div>,
        <div key="life" className={s.plane}>
          <Ambient stop={lifeStop} on={lifeOn} phone={phone} />
        </div>,
      );
    }
  }
  return (
    <div className={`${s.world} ${worldCls}`} data-world aria-hidden="true">
      <div className={s.sky} ref={skyRef} />
      {out}
    </div>
  );
});
