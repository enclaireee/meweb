'use client';
// b6: the lantern vault. Choreography from ../transitions. Hero: the lanterns ignite in a depth wave, far to near.
import type { CSSProperties } from 'react';
import type { BeatDef, Comp, Keyframe, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b6-lantern-vault/manifest.json';
import jellyfish from '../../../public/art/creatures/jellyfish/manifest.json';
import { Creature } from '../Creature';
import { useLang, useT } from '../lang';
import { At, Kicker, Ln, SectionHeading } from '../SceneText';
import { onLayer, world } from '../transitions';

// Text: floating words scattered through the vault in viewport space, never pinned to the dollying
// lantern layers (that grew them off-frame). The box is inset well inside the paper frame and each
// spot below keeps to the dark half of the vault, left of the jellyfish (which fills the centre-right).
// Spots are % of the box: [x, y, size tier]; x < 0 means anchored from the right edge (-x %).
type Spot = [number, number, 1 | 2 | 3];
const spots: { label: [number, number]; items: Spot[] }[] = [
  { label: [1, 22], items: [[1, 29, 1], [15, 33, 2], [5, 41, 2], [22, 45, 3], [11, 52, 2]] },
  { label: [32, 4], items: [[34, 11, 1], [46, 15, 2], [31, 22, 2], [44, 27, 3], [33, 34, 2], [49, 37, 3], [37, 44, 2], [47, 51, 3]] },
  { label: [3, 68], items: [[1, 75, 2], [24, 83, 2], [47, 75, 1], [41, 92, 3]] },
];
const size = { 1: 'text-lead font-semibold', 2: 'text-body font-semibold', 3: 'text-body' };
const OUT = 0.66; // words leave here (the dive starts at 0.68)
const glowText = '[text-shadow:0_0_14px_rgb(255_170_80/0.75),0_0_32px_rgb(255_140_50/0.35),0_2px_8px_rgb(0_0_0/0.75)]';
const dot = <span className="size-2 shrink-0 rounded-full bg-[#ffd27a] shadow-[0_0_12px_4px_rgb(255_190_100/0.8)]" />;
const at = (x: number, y: number) => (x < 0 ? { right: `${-x}%`, top: `${y}%` } : { left: `${x}%`, top: `${y}%` });
// Each word bobs on its own slow cycle so the cloud never moves in step.
const bob = (i: number, j: number) => ({ '--dur': `${5 + ((i * 3 + j * 7) % 5) * 0.7}s`, '--delay': `${-((i * 5 + j * 3) % 7) * 0.8}s` }) as CSSProperties;

function useGroups() {
  const t = useT();
  return scenes.b6.map((g, i) => ({
    label: t(g.label),
    items: (typeof g.items === 'string' ? g.items : t(g.items)).split(' · '),
    from: 0.2 + 0.09 * i,
  }));
}
function Head() {
  const t = useT();
  return (
    <At a={0.18} d={0.04} w={OUT - 0.18} k="one" className={`block ${glowText}`}>
      <div className="beat-text flex max-w-[17rem] flex-col gap-1 portrait:max-w-none">
        <Ln i={0}><Kicker slug="b6-lantern-vault" /></Ln>
        <Ln i={1}><p className="font-display text-body italic">{t(scenes.b6Languages)}</p></Ln>
      </div>
    </At>
  );
}
const Label = ({ text, a }: { text: string; a: number }) => (
  <At a={a} d={0.04} w={OUT - a} k="one" className={`block text-label font-semibold tracking-[0.3em] whitespace-nowrap uppercase ${glowText}`}>
    <Ln i={0}>
      <span className="flex items-center gap-3">
        {dot}
        {text}
      </span>
    </Ln>
  </At>
);
const Word = ({ text, a, tier, i, j }: { text: string; a: number; tier: 1 | 2 | 3; i: number; j: number }) => (
  <At a={a} d={0.04} w={OUT - a} k="one" className={`block font-display leading-tight whitespace-nowrap ${size[tier]} ${glowText}`}>
    <Ln i={0}><span className="float-word block" style={bob(i, j)}>{text}</span></Ln>
  </At>
);

function SkillsDesktop() {
  const groups = useGroups();
  return (
    <div aria-hidden className="relative size-full text-[#ffe9c4]">
      <Head />
      {groups.map((g, i) => {
        const s = spots[i]!;
        return (
          <div key={i}>
            <div className="absolute" style={at(...s.label)}><Label text={g.label} a={g.from} /></div>
            {g.items.map((x, j) => {
              const [px, py, tier] = s.items[j] ?? s.items[s.items.length - 1]!;
              return (
                <div key={j} className="absolute" style={at(px, py)}>
                  <Word text={x} a={g.from + 0.01 * (j + 1)} tier={tier} i={i} j={j} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Portrait: no room to scatter freely, so groups alternate sides and words wrap with an uneven drop.
function SkillsPortrait() {
  const groups = useGroups();
  return (
    <div aria-hidden className="flex flex-col gap-6 text-[#ffe9c4]">
      <Head />
      {groups.map((g, i) => {
        const right = i % 2 === 1;
        return (
          <section key={i} className={`flex flex-col gap-2 ${right ? 'items-end text-right' : 'items-start'}`}>
            <Label text={g.label} a={g.from} />
            <ul className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 ${right ? 'justify-end' : ''}`}>
              {g.items.map((x, j) => (
                <li key={j} style={{ marginTop: `${(j % 3) * 0.35}rem` }}>
                  <Word text={x} a={g.from + 0.01 * (j + 1)} tier={j === 0 ? 1 : j % 3 === 2 ? 3 : 2} i={i} j={j} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
const skills = <SkillsDesktop />;
const skillsP = <SkillsPortrait />;
// Creature box of width w whose anchor point sits at (ax, ay); height follows the sprite frame.
const box = (ax: number, ay: number, w: number) => {
  const [cx, cy] = jellyfish.anchor as [number, number];
  const k = w / jellyfish.frame.w;
  return { x: ax - cx * k, y: ay - cy * k, w, h: jellyfish.frame.h * k };
};
const SCREENS = 1.9;
// The jellyfish bobs on a wrapper (the engine owns the overlay's transform).
const jelly = (
  <div className="amb-bob size-full" style={{ '--amb-y': '10px', '--amb-dur': '5.5s' } as CSSProperties}>
    <Creature sheet={jellyfish} ms={2400} />
  </div>
);

const ignite = (at: number): LayerDef['track'] => [{ at, opacity: 0 }, { at: at + 0.12, opacity: 1, ease: 'out' }];
const sway = (dur: string, delay: string, r: string): LayerDef['live'] => ({ className: 'amb-sway', style: { '--amb-dur': dur, '--amb-delay': delay, '--amb-r': r, '--amb-origin': '50% 0%' } as CSSProperties });
const extra: Record<string, LayerDef> = {};
for (const s of ['', '-p']) {
  extra[`lanterns-far${s}`] = { track: ignite(0.12) };
  extra[`lanterns-mid${s}`] = { track: ignite(0.17), origin: '50% 0%', live: sway('7.5s', '-2s', '0.7deg') };
  extra[`lanterns-near${s}`] = { track: ignite(0.22), origin: '50% 0%', live: sway('6s', '-4s', '1deg') };
  extra[`embers${s}`] = { highOnly: true, track: [{ at: 0, y: 0 }, { at: 1, y: -50 }] };
}
// Gates close less than the default, so the vault stays visible between them.
const comp = (c: Comp, focus: [number, number], close: number) => world(manifest, c, SCREENS, { focus, close, extra });
const desktop = comp('desktop', [1460, 520], 380);
const portrait = comp('portrait', [620, 600], 260);
const drift: Keyframe[] = [{ at: 0.16, y: 40, opacity: 0 }, { at: 0.3, y: 0, opacity: 1 }, { at: 0.7, y: -50, opacity: 1 }, { at: 0.8, y: -70, opacity: 0 }];
// Words and heading: the engine hides them outside this window; the rows inside slide in and out.
const shown: Keyframe[] = [{ at: 0.165, opacity: 0 }, { at: 0.175, opacity: 1 }, { at: OUT + 0.055, opacity: 1 }, { at: OUT + 0.065, opacity: 0 }];

function Head2({ p = false }: { p?: boolean }) {
  const { lang } = useLang();
  const size = p ? (lang === 'id' ? 'text-[15cqw]' : 'text-[19cqw]') : lang === 'id' ? 'text-[19cqw]' : 'text-[24cqw]';
  return <SectionHeading slug="b6-lantern-vault" size={size} className="text-[#ffe9c4]" />;
}
const head = <Head2 />;
const headP = <Head2 p />;

export const b6LanternVault: BeatDef = {
  slug: 'b6-lantern-vault',
  screens: SCREENS,
  manifest,
  // focus = the far exit arch. The heading hangs behind the near strings and chains.
  desktop: {
    ...desktop,
    split: 'strings-near',
    overlays: [
      onLayer(desktop, 'strings-near', { x: 430, y: 60, w: 700, h: 230 }, head, { behind: true, track: shown }),
      { node: jelly, rect: box(1180, 250, 340), parallax: 0.5, track: drift },
      { node: skills, className: 'left-[11vw] right-[11vw] top-[27vh] bottom-[12vh]', track: shown },
    ],
  },
  portrait: {
    ...portrait,
    split: 'strings-near-p',
    overlays: [
      onLayer(portrait, 'strings-near-p', { x: 110, y: 200, w: 860, h: 260 }, headP, { behind: true, track: shown }),
      { node: jelly, rect: box(330, 600, 300), parallax: 0.5, track: drift },
      { node: skillsP, className: 'left-[9vw] right-[9vw] bottom-[9svh]', track: shown },
    ],
  },
};
