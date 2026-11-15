// Shared scroll choreography for every beat, so all scene changes use one vocabulary:
//  - dolly: each layer scales about the beat's focus point, near layers faster (camera travels through the paper)
//  - gates: the beat's `gate-l*` / `gate-r*` sheets slide in from off-screen, close over the previous beat,
//    then part to reveal this one. The scene behind appears while the gates are shut, so there is no cross-fade.
//  - dive: before the next beat's gates close, the whole beat accelerates into its focus point.
// Everything is a pure function of t (reversible) and only keys transform/opacity.
import type { ReactNode } from 'react';
import type { Comp, CompositionDef, Keyframe, LayerDef, Manifest, OverlayDef, Rect, Track } from '@/engine';

// Transition windows, in screens relative to the beat start.
const SLIDE = -0.55; // gates start entering
const SHUT = -0.2; // gates closed
const OPEN = 0.3; // gates at rest

/** Join tracks that key different props of one layer (e.g. dolly + sway). */
export const merge = (...ts: (Track | undefined)[]): Keyframe[] => ts.flatMap((t) => t ?? []).sort((a, b) => a.at - b.at);

export type WorldOpts = {
  /** Design px the camera travels toward (the exit aperture). */
  focus: [number, number];
  /** Total scale gain of the nearest layer over the beat. Negative = pull-back: layers start enlarged and settle to 1. */
  push?: number;
  /** Design px a gate moves inward from rest to shut (default: art-bible G3). */
  close?: number;
  first?: boolean; // no entry transition
  last?: boolean; // no exit transition
  /** Extra per-layer defs; their tracks are merged with the generated ones. */
  extra?: Record<string, LayerDef>;
};

/** Group + layer choreography for one composition, generated from the manifest's depth order. */
export function world(manifest: Manifest, comp: Comp, screens: number, o: WorldOpts): Pick<CompositionDef, 'group' | 'groupOrigin' | 'layers'> {
  const { width: W, height: H, layers: ml } = manifest.compositions[comp];
  const a = (s: number) => s / screens;
  const [fx, fy] = o.focus;
  const push = o.push ?? 0.16;
  const isGate = (id: string) => /^gate-[lrtb]/.test(id);
  const scene = ml.filter((l) => !isGate(l.id)).sort((p, q) => p.depth - q.depth);
  const layers: Record<string, LayerDef> = {};

  scene.forEach((l, i) => {
    const d = scene.length > 1 ? i / (scene.length - 1) : 0;
    const k = push * (0.12 + 0.88 * d * d); // scale gain per beat
    const track: Keyframe[] =
      k < 0
        ? [{ at: a(SHUT), scale: 1 - k }, { at: 0.7, scale: 1, ease: 'out' }]
        : [{ at: a(SHUT), scale: 1 + k * a(SHUT) }, { at: 1 - a(SHUT), scale: 1 + k * (1 - a(SHUT)) }];
    const x = o.extra?.[l.id];
    // A layer whose own track starts hidden (a hero reveal) needs no entry fade.
    const hidden = x?.track?.find((f) => f.opacity !== undefined)?.opacity === 0;
    if (!o.first && !hidden) track.push({ at: a(-0.3), opacity: 0 }, { at: a(SHUT), opacity: 1 });
    layers[l.id] = {
      parallax: 0.04 + 0.8 * d,
      origin: `${((fx - l.x) / l.w) * 100}% ${((fy - l.y) / l.h) * 100}%`,
      ...x,
      track: merge(track, x?.track),
    };
  });

  // Art-bible G3: closed shift per gate kind (design px); sheets bleed far enough to still cover the edge.
  for (const l of ml.filter((g) => isGate(g.id))) {
    const k = l.id[5] as 'l' | 'r' | 't' | 'b';
    const ax = k === 'l' || k === 'r' ? 'x' : 'y';
    const dir = k === 'l' || k === 't' ? 1 : -1; // +1 moves toward the centre in +x / +y
    const shut = o.close ?? (ax === 'y' ? 780 : W > 1500 ? 700 : 460);
    const far = -dir * (ax === 'y' ? 1.1 * H : 0.95 * W); // fully off-screen
    const rest: Keyframe[] = [{ at: a(OPEN), [ax]: 0, ease: 'inOut' }, { at: 1, [ax]: -dir * 0.04 * W }];
    const track: Keyframe[] = o.first
      ? [{ at: 0, [ax]: 0 }, { at: 1, [ax]: -dir * 0.04 * W }]
      : [{ at: a(SLIDE), [ax]: far }, { at: a(SHUT), [ax]: dir * shut, ease: 'inOut' }, ...rest];
    const x = o.extra?.[l.id];
    layers[l.id] = { parallax: 1, ...x, track: merge(track, x?.track) };
  }

  const group: Keyframe[] = [];
  if (!o.first) group.push({ at: a(SLIDE) - 0.001, opacity: 0 }, { at: a(SLIDE), opacity: 1 });
  else group.push({ at: 0, opacity: 1 });
  if (!o.last) {
    group.push(
      { at: 1 - a(0.6), scale: 1 },
      { at: 1 - a(0.15), scale: 1.4, ease: 'in' }, // dive into the aperture
      { at: 1 + a(0.1), opacity: 1 },
      { at: 1 + a(0.1) + 0.001, opacity: 0 }, // fully covered by the next beat by now
    );
  }
  return { group: merge(group), groupOrigin: o.focus, layers };
}

/** Text block: rises in after the gates part, leaves before the dive. */
export const reveal = (o: { first?: boolean; last?: boolean } = {}): Keyframe[] => [
  ...(o.first ? [{ at: 0, opacity: 1, y: 0 }] : [{ at: 0.1, opacity: 0, y: 28 }, { at: 0.24, opacity: 1, y: 0, ease: 'out' as const }]),
  ...(o.last ? [] : [{ at: 0.66, opacity: 1, y: 0 }, { at: 0.8, opacity: 0, y: -20, ease: 'in' as const }]),
];

/** Canvas-space overlay pinned to a world layer: rides its dolly (scale about the focus) and parallax,
 *  so text set "in" the scene stays on its art. `track` adds the overlay's own opacity/motion. */
export function onLayer(
  c: Pick<CompositionDef, 'layers' | 'groupOrigin'>, id: string, rect: Rect, node: ReactNode,
  o: { track?: Track; className?: string; behind?: boolean } = {},
): OverlayDef {
  const l = c.layers![id]!;
  const [fx, fy] = c.groupOrigin!;
  return {
    node, rect, behind: o.behind, className: o.className, parallax: l.parallax,
    style: { transformOrigin: `${((fx - rect.x) / rect.w) * 100}% ${((fy - rect.y) / rect.h) * 100}%` },
    track: merge(l.track?.filter((f) => f.scale !== undefined), o.track),
  };
}
