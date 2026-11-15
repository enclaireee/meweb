'use client';
// b5: the understory. Choreography from ../transitions. Hero: a second pair of leaf curtains parts to show the arch, the stag and the door.
import type { CSSProperties } from 'react';
import { enterLane, type BeatDef, type Comp, type Keyframe, type LayerDef, type OverlayDef, type Rect } from '@/engine';
import { projects, scenes, ui } from '@/content';
import { useT } from '../lang';
import manifest from '../../../public/art/b5-understory/manifest.json';
import stag from '../../../public/art/creatures/stag/manifest.json';
import { Creature } from '../Creature';
import { At, Kicker } from '../SceneText';
import { merge, onLayer, reveal, world } from '../transitions';

// Text: fireflies gather into a big 8 (the project count) over the stag, then scatter and land in three
// swarms sized by group, where the group names appear. Decorative: the door is the one control.
// Positions are design px; each dot reads --t (the beat's local progress) through CSS, so it is pure scroll.
const G0 = 0.16, G1 = 0.34, S0 = 0.46, S1 = 0.58; // gather, then scatter
const groups = ['web', 'data', 'hardware'] as const;
type Pt = [number, number];
type Plan = { rect: Rect; eight: [Pt, number, number]; swarms: Pt[]; word: Pt };
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}
function flies({ rect, eight: [[cx, cy], r1, r2], swarms }: Plan) {
  const r = rng(7);
  const ring = (n: number, y: number, rad: number): Pt[] => Array.from({ length: n }, (_, i) => [cx + rad * Math.cos((2 * Math.PI * i) / n), y + rad * Math.sin((2 * Math.PI * i) / n)]);
  const eight = [...ring(22, cy - r2, r1), ...ring(30, cy + r1, r2)];
  const sizes = groups.map((g) => projects.filter((p) => p.group === g).length);
  const total = sizes.reduce((x, y) => x + y, 0);
  // Swarm of each fly, in proportion to the group sizes.
  const of = sizes.flatMap((n, g) => Array<number>(Math.round((eight.length * n) / total)).fill(g));
  return eight.map((e, i) => {
    const [sx, sy] = swarms[of[i] ?? groups.length - 1]!, a = r() * 2 * Math.PI, d = 18 + 46 * Math.sqrt(r());
    return { from: [rect.x + r() * rect.w, rect.y + r() * rect.h] as Pt, at: e, to: [sx + d * Math.cos(a), sy + d * Math.sin(a) * 0.6] as Pt, delay: r() };
  });
}
function Fireflies({ plan }: { plan: Plan }) {
  const t = useT();
  const { rect } = plan;
  const u = (v: number, o: number) => ((v - o) / rect.w) * 100; // design px -> cqw of the rect
  const k = { '--g': `clamp(0, (var(--t, 0) - ${G0}) / ${G1 - G0}, 1)`, '--s': `clamp(0, (var(--t, 0) - ${S0}) / ${S1 - S0}, 1)` } as CSSProperties;
  return (
    <div aria-hidden className="@container relative h-full" style={k}>
      {flies(plan).map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={{ '--x0': u(f.from[0], rect.x), '--y0': u(f.from[1], rect.y), '--x1': u(f.at[0], rect.x), '--y1': u(f.at[1], rect.y), '--x2': u(f.to[0], rect.x), '--y2': u(f.to[1], rect.y), animationDelay: `${-f.delay * 2.4}s` } as CSSProperties}
        />
      ))}
      <span className="absolute -translate-x-1/2" style={{ left: `${u(plan.word[0], rect.x)}cqw`, top: `${u(plan.word[1], rect.y)}cqw` }}>
        <At a={G1 - 0.02} d={0.04} w={S0 - G1 + 0.02} k="one" className="beat-text block pl-[0.6em] text-[2.4cqw] font-semibold tracking-[0.55em] text-[#fff2c4] uppercase [text-shadow:0_0_10px_rgb(255_220_130/0.9),0_0_28px_rgb(255_190_90/0.6),0_2px_8px_rgb(0_0_0/0.75)]">{t(scenes.b5.word)}</At>
      </span>
      {groups.map((g, i) => {
        const [x, y] = plan.swarms[i]!;
        return (
          <span key={g} className="absolute -translate-x-1/2" style={{ left: `${u(x, rect.x)}cqw`, top: `${u(y + 52, rect.y)}cqw` }}>
            <At a={S1 - 0.03 + 0.025 * i} d={0.05} className="beat-text flex items-baseline gap-[0.9cqw] whitespace-nowrap text-[#fff6dc] [text-shadow:0_0_10px_rgb(255_220_130/0.9),0_0_28px_rgb(255_190_90/0.6),0_2px_8px_rgb(0_0_0/0.75)]">
              <span className="font-display text-[3cqw] font-semibold">{t(ui.projects.groups[g])}</span>
              <span className="font-display text-[3.6cqw] italic text-[#ffe9a8]">{projects.filter((p) => p.group === g).length}</span>
            </At>
          </span>
        );
      })}
    </div>
  );
}
const deskPlan: Plan = { rect: { x: 400, y: 120, w: 1400, h: 840 }, eight: [[880, 470], 92, 122], swarms: [[1290, 300], [1560, 470], [1330, 640]], word: [880, 820] };
const portPlan: Plan = { rect: { x: 60, y: 260, w: 960, h: 1400 }, eight: [[690, 610], 100, 132], swarms: [[300, 1150], [760, 1250], [400, 1400]], word: [690, 990] };
const swarm = { d: <Fireflies plan={deskPlan} />, p: <Fireflies plan={portPlan} /> };
function Hint() {
  const t = useT();
  return (
    <div className="flex flex-col items-end gap-4 portrait:items-start">
      <div aria-hidden className="beat-text flex flex-col gap-3 [text-shadow:0_0_10px_rgb(255_220_130/0.9),0_0_28px_rgb(255_190_90/0.6),0_2px_8px_rgb(0_0_0/0.75)]">
        <Kicker slug="b5-understory" />
        <p className="font-display text-[clamp(1.3rem,2vw,2.1rem)] italic">{t(scenes.b5.hint)}</p>
      </div>
      <button
        type="button"
        onClick={() => enterLane('projects')}
        className="min-h-11 cursor-pointer rounded-full border border-[#ffd27a]/70 bg-[#1b1406]/75 px-6 py-2.5 text-[0.8rem] tracking-[0.25em] text-[#fff2c4] uppercase shadow-[0_0_24px_rgb(255_200_110/0.35)] backdrop-blur-sm transition-[background-color,box-shadow] duration-200 hover:bg-[#3a2a0c]/85 hover:shadow-[0_0_36px_8px_rgb(255_200_110/0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd27a]"
      >
        {t(scenes.b5.cta)} →
      </button>
    </div>
  );
}
const text = <Hint />;
// In after the curtains part, out before the dive (1 - 0.6 / SCREENS).
const textT: Keyframe[] = [{ at: 0.08, opacity: 0 }, { at: 0.16, opacity: 1 }, { at: 0.72, opacity: 1 }, { at: 0.8, opacity: 0 }];

// The fork door (decisions: one consistent shape, a real focusable button) over the baked `fork-door` sheet.
function Door() {
  const t = useT();
  return (
    <button
      type="button"
      aria-label={t(ui.nav.enterProjects)}
      onClick={() => enterLane('projects')}
      className="absolute inset-0 min-h-11 min-w-11 cursor-pointer rounded-t-full transition-shadow duration-200 hover:shadow-[0_0_40px_12px_rgba(255,210,122,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd27a]"
    />
  );
}
const door = <Door />;
const SCREENS = 2.6;
const deer = <Creature sheet={stag} ms={6000} />;

const part = (dx: number): LayerDef['track'] => [{ at: 0.08, x: dx }, { at: 0.4, x: 0, ease: 'inOut' }];
const extra: Record<string, LayerDef> = {
  'curtain-mid-l': { track: part(520) },
  'curtain-mid-r': { track: part(-420) },
  'curtain-mid-l-p': { track: part(300) },
  'curtain-mid-r-p': { track: part(-260) },
  fireflies: { highOnly: true },
  'fireflies-p': { highOnly: true },
};
// Desktop gates rest wider apart than the standard shift closes (art report), so they travel 880.
const comp = (c: Comp, focus: [number, number], close?: number) => world(manifest, c, SCREENS, { focus, close, extra });

// The button rides the `fork-door` layer's dolly (same scale track, origin and parallax) so it stays on the art.
const doorOn = (c: ReturnType<typeof comp>, [fx, fy]: [number, number], rect: Rect): OverlayDef => {
  const l = c.layers!['fork-door']!;
  return {
    node: door,
    rect,
    parallax: l.parallax,
    style: { transformOrigin: `${((fx - rect.x) / rect.w) * 100}% ${((fy - rect.y) / rect.h) * 100}%` },
    track: merge(l.track?.filter((f) => f.scale !== undefined), reveal()),
  };
};
const desktop = comp('desktop', [820, 650], 880);
const portrait = comp('portrait', [580, 800]);

export const b5Understory: BeatDef = {
  slug: 'b5-understory',
  screens: SCREENS,
  manifest,
  // calm zone is the dark undergrowth on the right
  desktop: {
    ...desktop,
    split: 'shafts',
    overlays: [
            { node: deer, rect: { x: 560, y: 350, w: 640, h: 555 }, parallax: 0.3, track: reveal() }, // hooves (880, 905)
      doorOn(desktop, [820, 650], { x: 446, y: 590, w: 96, h: 160 }),
      onLayer(desktop, 'fork-door', deskPlan.rect, swarm.d, { track: textT }),
      { node: text, className: 'right-[9vw] bottom-[11vh] w-[min(32vw,32rem)] text-right', track: textT },
    ],
  },
  portrait: {
    ...portrait,
    split: 'shafts-p',
    overlays: [
            { node: deer, rect: { x: 440, y: 590, w: 520, h: 450 }, parallax: 0.3, track: reveal() }, // hooves (700, 1040)
      doorOn(portrait, [580, 800], { x: 250, y: 790, w: 90, h: 150 }),
      onLayer(portrait, 'fork-door', portPlan.rect, swarm.p, { track: textT }),
      { node: text, className: 'left-[8vw] right-[8vw] top-[8svh]', track: textT },
    ],
  },
};
