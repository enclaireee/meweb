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

export type LayerDef = { track?: Track; parallax?: number; origin?: string; highOnly?: boolean };

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
};

export type CompositionDef = {
  group?: Track;
  groupOrigin?: [number, number];
  layers?: Record<string, LayerDef>;
  overlays?: OverlayDef[];
  /** Layer id: it and every nearer layer go on a second canvas, above `behind` overlays. */
  split?: string;
};

export type FrameCtx = { comp: Comp; reducedMotion: boolean; quality: Quality; s: number; k: number };

export type BeatDef = {
  slug: string;
  screens: number;
  manifest: Manifest;
  desktop: CompositionDef;
  portrait: CompositionDef;
  still?: number;
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
