'use client';
// b5: the understory. Choreography from ../transitions. Hero: a second pair of leaf curtains parts to show the arch, the stag and the door.
import type { CSSProperties } from 'react';
import { enterLane, type BeatDef, type Comp, type Keyframe, type LayerDef, type OverlayDef, type Rect } from '@/engine';
import { projects, scenes, ui } from '@/content';
import { useLang, useT } from '../lang';
import manifest from '../../../public/art/b5-understory/manifest.json';
import stag from '../../../public/art/creatures/stag/manifest.json';
import { Creature } from '../Creature';
import { Particles } from '../Ambient';
import { At, Kicker, Ln, SectionHeading } from '../SceneText';
import { merge, onLayer, world } from '../transitions';

// Text: fireflies gather into a big 8 (the project count) over the stag, then scatter and land in three
// swarms sized by group, where the group names appear. Decorative: the door is the one control.
// Positions are design px; each dot reads --t (the beat's local progress) through CSS, so it is pure scroll.
const G0 = 0.2, G1 = 0.34, S0 = 0.43, S1 = 0.53, OUT = 0.65; // gather, then scatter; text leaves at OUT (the dive starts at 0.68)
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
        <At a={G1 - 0.02} d={0.04} w={S0 - G1 + 0.02} k="one" className="beat-text block pl-[0.6em] text-[max(12px,2.4cqw)] font-semibold tracking-[0.55em] text-[#fff2c4] uppercase [text-shadow:0_0_10px_rgb(255_220_130/0.9),0_0_28px_rgb(255_190_90/0.6),0_2px_8px_rgb(0_0_0/0.75)]"><Ln i={0}>{t(scenes.b5.word)}</Ln></At>
      </span>
      {groups.map((g, i) => {
        const [x, y] = plan.swarms[i]!;
        const a = S1 - 0.03 + 0.02 * i;
        return (
          <span key={g} className="absolute -translate-x-1/2" style={{ left: `${u(x, rect.x)}cqw`, top: `${u(y + 52, rect.y)}cqw` }}>
            <At a={a} d={0.05} w={OUT - a} k="one" className="beat-text block whitespace-nowrap text-[#fff6dc] [text-shadow:0_0_10px_rgb(255_220_130/0.9),0_0_28px_rgb(255_190_90/0.6),0_2px_8px_rgb(0_0_0/0.75)]">
              <Ln i={0}>
                <span className="flex items-baseline gap-[0.9cqw]">
                  <span className="font-display text-[3cqw] font-semibold">{t(ui.projects.groups[g])}</span>
                  <span className="font-display text-[3.6cqw] italic text-[#ffe9a8]">{projects.filter((p) => p.group === g).length}</span>
                </span>
              </Ln>
            </At>
          </span>
        );
      })}
    </div>
  );
}
const deskPlan: Plan = { rect: { x: 400, y: 120, w: 1400, h: 840 }, eight: [[880, 470], 92, 122], swarms: [[1260, 390], [1560, 520], [1300, 640]], word: [880, 820] };
const portPlan: Plan = { rect: { x: 60, y: 260, w: 960, h: 1400 }, eight: [[690, 610], 100, 132], swarms: [[330, 1340], [760, 1420], [420, 1500]], word: [690, 990] };
const swarm = { d: <Fireflies plan={deskPlan} />, p: <Fireflies plan={portPlan} /> };
function Hint() {
  const t = useT();
  return (
    <At a={0.2} d={0.05} w={OUT - 0.2} k="one" className="block">
      <div className="flex flex-col items-end gap-3 portrait:paper-card portrait:items-start">
        <div aria-hidden className="beat-text flex flex-col gap-2 [text-shadow:0_0_10px_rgb(255_220_130/0.9),0_0_28px_rgb(255_190_90/0.6),0_2px_8px_rgb(0_0_0/0.75)] portrait:[text-shadow:none]">
          <Ln i={0}><Kicker slug="b5-understory" /></Ln>
          <Ln i={1}><p className="font-display text-lead italic">{t(scenes.b5.hint)}</p></Ln>
        </div>
        <Ln i={2}>
          <button
            type="button"
            onClick={() => enterLane('projects')}
            className="min-h-11 cursor-pointer rounded-full border border-[#ffd27a]/70 bg-[#1b1406]/95 px-6 py-2.5 text-label font-semibold tracking-[0.25em] text-[#fff2c4] uppercase shadow-[0_0_24px_rgb(255_200_110/0.35)] transition-[background-color,box-shadow] duration-200 hover:bg-[#3a2a0c]/85 hover:shadow-[0_0_36px_8px_rgb(255_200_110/0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd27a]"
          >
            {t(scenes.b5.cta)} →
          </button>
        </Ln>
      </div>
    </At>
  );
}
const text = <Hint />;

/** A block that shows over [a, b]: the engine hides it (and its focus) outside, the rows inside slide in and out. */
const shown = (a: number, b: number): Keyframe[] => [{ at: a - 0.012, opacity: 0 }, { at: a, opacity: 1 }, { at: b + 0.055, opacity: 1 }, { at: b + 0.065, opacity: 0 }];
const textT = shown(0.2, OUT);
const headT = shown(0.18, OUT);
// Heading: Projects, set on the forest floor in front of the curtains, behind the near roots and the fireflies.
function Head({ p = false }: { p?: boolean }) {
  const { lang } = useLang();
  const size = lang === 'id' ? (p ? 'text-[20cqw]' : 'text-[21cqw]') : p ? 'text-[16cqw]' : 'text-[17cqw]';
  return <SectionHeading slug="b5-understory" size={size} className="text-[#f4f1cf]" />;
}
const head = <Head />;
const headP = <Head p />;

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
const SCREENS = 1.9;
const deer = <Creature sheet={stag} ms={6000} />;
// Door and stag arrive as the curtains part and stay to the end (the door must stay reachable).
const arrive: Keyframe[] = [{ at: 0.1, opacity: 0 }, { at: 0.2, opacity: 1, ease: 'out' }, { at: 0.86, opacity: 1 }, { at: 0.93, opacity: 0 }];
const ambient: Keyframe[] = [{ at: 0.14, opacity: 0 }, { at: 0.22, opacity: 1 }, { at: 0.76, opacity: 1 }, { at: 0.84, opacity: 0 }];

// Idle: leaves drift down, a few spare fireflies twinkle. `lite` ones are what touch and low-quality devices get.
const air = (big: number) => (
  <>
    <Particles sprite="leaf-1" kind="fall" n={3} seed={3} lite size={[big, big * 1.7]} />
    <Particles sprite="leaf-2" kind="fall" n={3} seed={5} lite size={[big, big * 1.7]} />
    <Particles sprite="leaf-3" kind="fall" n={3} seed={9} lite size={[big, big * 1.7]} />
    <Particles sprite="leaf-1" kind="fall" n={4} seed={13} size={[big, big * 1.7]} />
    <Particles sprite="leaf-3" kind="fall" n={4} seed={17} size={[big, big * 1.7]} />
    <Particles sprite="mote" kind="twinkle" n={8} seed={4} lite size={[0.5, 0.9]} area={[10, 15, 95, 85]} />
    <Particles sprite="mote" kind="twinkle" n={10} seed={8} size={[0.4, 0.8]} area={[10, 15, 95, 85]} />
  </>
);
const fall = { d: air(1.2), p: air(2.4) };

const part = (dx: number): LayerDef['track'] => [{ at: 0.1, x: dx }, { at: 0.3, x: 0, ease: 'inOut' }];
const extra: Record<string, LayerDef> = {
  'curtain-mid-l': { track: part(520) },
  'curtain-mid-r': { track: part(-420) },
  'curtain-mid-l-p': { track: part(300) },
  'curtain-mid-r-p': { track: part(-260) },
  fireflies: { highOnly: true },
  'fireflies-p': { highOnly: true },
};
// Gates close less than the default so the forest stays visible between them (they never meet).
const comp = (c: Comp, focus: [number, number], close: number) => world(manifest, c, SCREENS, { focus, close, extra });

// The button rides the `fork-door` layer's dolly (same scale track, origin and parallax) so it stays on the art.
const doorOn = (c: ReturnType<typeof comp>, [fx, fy]: [number, number], rect: Rect): OverlayDef => {
  const l = c.layers!['fork-door']!;
  return {
    node: door,
    rect,
    parallax: l.parallax,
    style: { transformOrigin: `${((fx - rect.x) / rect.w) * 100}% ${((fy - rect.y) / rect.h) * 100}%` },
    track: merge(l.track?.filter((f) => f.scale !== undefined), arrive),
  };
};
const desktop = comp('desktop', [820, 650], 440);
const portrait = comp('portrait', [580, 800], 90);

export const b5Understory: BeatDef = {
  slug: 'b5-understory',
  screens: SCREENS,
  manifest,
  // calm zone is the dark undergrowth on the right
  desktop: {
    ...desktop,
    split: 'roots-near',
    overlays: [
      { node: deer, rect: { x: 560, y: 350, w: 640, h: 555 }, parallax: 0.3, track: arrive }, // hooves (880, 905)
      doorOn(desktop, [820, 650], { x: 446, y: 590, w: 96, h: 160 }),
      onLayer(desktop, 'roots-near', { x: 1050, y: 770, w: 680, h: 200 }, head, { behind: true, track: headT }),
      onLayer(desktop, 'fork-door', deskPlan.rect, swarm.d, { track: textT }),
      { node: fall.d, rect: { x: 0, y: 0, w: 1920, h: 1080 }, parallax: 0.3, track: ambient },
      { node: text, className: 'right-[9vw] top-[14vh] w-[min(32vw,32rem)] text-right', track: textT },
    ],
  },
  portrait: {
    ...portrait,
    split: 'roots-near-p',
    overlays: [
      { node: deer, rect: { x: 440, y: 590, w: 520, h: 450 }, parallax: 0.3, track: arrive }, // hooves (700, 1040)
      doorOn(portrait, [580, 800], { x: 250, y: 790, w: 90, h: 150 }),
      onLayer(portrait, 'roots-near-p', { x: 170, y: 1080, w: 740, h: 220 }, headP, { behind: true, track: headT }),
      onLayer(portrait, 'fork-door', portPlan.rect, swarm.p, { track: textT }),
      { node: fall.p, rect: { x: 0, y: 0, w: 1080, h: 1920 }, parallax: 0.3, track: ambient },
      { node: text, className: 'left-[8vw] right-[8vw] top-[12svh]', track: textT },
    ],
  },
};
