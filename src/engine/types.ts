import type { CSSProperties, ReactNode } from 'react';

export type Comp = 'desktop' | 'portrait';
export type Lane = 'main' | 'projects';
export type Quality = 'high' | 'low';

/** Easing used to arrive at the keyframe that declares it. */
export type Ease = 'linear' | 'in' | 'out' | 'inOut' | ((u: number) => number);

export type Keyframe = {
  at: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  rotateY?: number;
  opacity?: number;
  ease?: Ease;
};
export type Track = readonly Keyframe[];
export type Pose = { x: number; y: number; scale: number; rotate: number; rotateY: number; opacity: number };

export type Rect = { x: number; y: number; w: number; h: number };

export type ManifestLayer = Rect & { id: string; src: string; depth: number };
export type Manifest = {
  slug: string;
  compositions: Record<Comp, { width: number; height: number; layers: ManifestLayer[] }>;
  bytes: number;
};

/** A layer lifted out of the canvas as a DOM element so CSS can animate it while idle (quality 'high' only). */
export type LiveDef = { className: string; style?: CSSProperties };

export type LayerDef = {
  track?: Track;
  parallax?: number;
  /** CSS transform-origin as percentages or keywords (e.g. '0% 50%', 'left bottom'); default '50% 50%'. */
  origin?: string;
  highOnly?: boolean;
  /** Opening sequence (beat 0 of the main lane only). Keyframe `at` = intro progress 0..1. Blended with the scroll pose. */
  intro?: Track;
  /** Rendered as `<div data-live=id class=className><img/></div>` instead of drawn into the canvas (high quality, full motion). */
  live?: LiveDef;
};

export type OverlayDef = {
  node: ReactNode;
  track?: Track;
  rect?: Rect;
  className?: string;
  style?: CSSProperties;
  parallax?: number;
  highOnly?: boolean;
  /** With rect and the composition's `split`: drawn under the art from `split` on (text behind a ridge). */
  behind?: boolean;
  /** Opening sequence (beat 0 of the main lane only), see LayerDef.intro. */
  intro?: Track;
};

export type CompositionDef = {
  group?: Track;
  groupOrigin?: [number, number];
  layers?: Record<string, LayerDef>;
  overlays?: OverlayDef[];
  /** Layer id: it and every nearer layer go on a second canvas, above `behind` overlays. */
  split?: string;
};

export type IntroPhase = 'pending' | 'play' | 'done';

export type FrameCtx = { comp: Comp; reducedMotion: boolean; quality: Quality; s: number; k: number };

export type BeatDef = {
  slug: string;
  screens: number;
  manifest: Manifest;
  desktop: CompositionDef;
  portrait: CompositionDef;
  still?: number;
  /** Opening sequence length (beat 0 of the main lane only; clamped to 2500 ms). Needs `intro` tracks to show anything. */
  intro?: { ms: number };
  onProgress?: (t: number, el: HTMLElement, ctx: FrameCtx) => void;
};

export type Frame = {
  lane: Lane;
  s: number;
  progress: number;
  velocity: number;
  beat: number;
  t: number;
  unit: number;
  pointer: { x: number; y: number };
};

export type SpriteSheet = { src: string; frames: Rect[]; anchor: { x: number; y: number } };
