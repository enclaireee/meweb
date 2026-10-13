"use client";
// The layered world: art tiles per layer, fireflies at three depths and the traveller, in draw order (layers.md).
// Nothing here re-renders per frame: movement is CSS reading --pos/--px/--py from the stage.
import { memo, type CSSProperties, type RefCallback, type RefObject } from "react";
import manifest from "../../../public/art/desktop/manifest.json";
import { dials } from "@/content/site";
import { visibleTiles, type Layout } from "@/lib/layout";
import { Ambient } from "./Ambient";
import { TRAVELLER_SVG } from "./traveller.generated";
import s from "./river.module.css";

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

function Fireflies({ depth, stops, active, phone }: { depth: 0 | 1 | 2; stops: number[]; active: number; phone: boolean }) {
  const d = FF[depth];
  return (
    <div className={s.layer} style={{ "--s": d.s } as CSSProperties}>
      {stops.map((i) => {
        const n = Math.ceil(dials[i]!.ff[depth] / (phone ? 2 : 1));
        return (
          <div key={i} className={s.ffSet} data-on={i === active}>
            {Array.from({ length: n }, (_, j) => {
              const x = 1200 + d.s * i * 1700 + (hash(i, j, depth, 1) * 1900 - 600) * Math.max(1, d.s * 0.8);
              const y = d.y[0] + hash(i, j, depth, 2) * (d.y[1] - d.y[0]);
              const size = d.size[0] + hash(i, j, depth, 3) * (d.size[1] - d.size[0]);
              const style = {
                "--x": x,
                "--y": y,
                "--size": size,
                animationDelay: `${-hash(i, j, 4) * 9}s, ${-hash(i, j, 5) * 4}s`,
                animationDuration: `${7 + hash(i, j, 6) * 5}s, ${2.5 + hash(i, j, 7) * 2}s`,
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
  /** Pos range the tiles must cover (the current move, or [stop, stop] at rest). */
  lo: number;
  hi: number;
  ffStops: number[];
  ffActive: number;
  travellerState: string;
  /** Collects layer elements that need per-frame fx (opacity/offset by pos). */
  fxRef: (id: string, fx: string) => RefCallback<HTMLDivElement>;
  /** The CSS sky behind layer 00; River paints it per frame. */
  skyRef: RefObject<HTMLDivElement | null>;
  /** Stop whose ambient life plays, and whether it shows (at rest only). */
  lifeStop: number;
  lifeOn: boolean;
};

export const World = memo(function World({ L, lo, hi, ffStops, ffActive, travellerState, fxRef, skyRef, lifeStop, lifeOn }: Props) {
  const phone = L.profile === "phone";
  const out: React.ReactNode[] = [];
  for (const layer of LAYERS) {
    const idx = visibleTiles(layer.tiles, layer.s, lo, hi, L);
    out.push(
      <div
        key={layer.id}
        className={s.layer}
        data-layer={layer.id}
        style={{ "--s": layer.s } as CSSProperties} ref={layer.fx ? fxRef(layer.id, layer.fx) : undefined}>
        {idx.map((i) => {
          const t = layer.tiles[i]!;
          return (
            // eslint-disable-next-line @next/next/no-img-element -- pre-built SVG art tiles, next/image adds nothing here
            <img key={t.f} className={s.tile} src={`/art/desktop/${t.f}`} alt="" decoding="async" draggable={false} style={{ "--x": t.x, "--w": t.w } as CSSProperties} />
          );
        })}
      </div>,
    );
    FF.forEach((d, depth) => {
      if (d.after === layer.id) out.push(<Fireflies key={`ff${depth}`} depth={depth as 0 | 1 | 2} stops={ffStops} active={ffActive} phone={phone} />);
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
    <div className={s.world} aria-hidden="true">
      <div className={s.sky} ref={skyRef} />
      {out}
    </div>
  );
});
