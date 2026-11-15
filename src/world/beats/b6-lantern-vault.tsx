'use client';
// b6: the lantern vault. Choreography from ../transitions. Hero: the lanterns ignite in a depth wave, far to near.
import type { BeatDef, Comp, LayerDef, Rect } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b6-lantern-vault/manifest.json';
import jellyfish from '../../../public/art/creatures/jellyfish/manifest.json';
import { Creature } from '../Creature';
import { useT } from '../lang';
import { At, Kicker } from '../SceneText';
import { onLayer, reveal, world } from '../transitions';

// Text: each skill group is a label hung on a lantern row; it ignites with its row, far to near.
function Lantern({ i }: { i: number }) {
  const t = useT();
  const g = scenes.b6[i]!;
  return (
    <div aria-hidden className="@container h-full">
      <At a={0.14 + 0.08 * i} d={0.08} className="flex flex-col gap-[2.5cqw] text-[#ffe9c4] [text-shadow:0_0_2cqw_rgb(255_170_80/0.9),0_0_7cqw_rgb(255_140_50/0.55),0_2px_10px_rgb(0_0_0/0.6)]">
        <span className="flex items-center gap-[3cqw] text-[4cqw] tracking-[0.32em] uppercase">
          <span className="size-[2.4cqw] rounded-full bg-[#ffd27a] shadow-[0_0_3cqw_1cqw_rgb(255_190_100/0.8)]" />
          {t(g.label)}
        </span>
        <span className="font-display text-[8cqw] leading-[1.1] text-balance">{typeof g.items === 'string' ? g.items : t(g.items)}</span>
      </At>
    </div>
  );
}
const labels = [0, 1, 2].map((i) => <Lantern key={i} i={i} />);
function Head() {
  const t = useT();
  return (
    <div aria-hidden className="beat-text flex flex-col gap-2">
      <Kicker slug="b6-lantern-vault" />
      <p className="font-display text-[clamp(1rem,1.3vw,1.3rem)] italic opacity-85">{t(scenes.b6Languages)}</p>
    </div>
  );
}
const head = <Head />;
const out = [{ at: 0.72, opacity: 1 }, { at: 0.82, opacity: 0 }];
const hang = (c: ReturnType<typeof comp>, at: [string, Rect][]) => at.map(([id, r], i) => onLayer(c, id, r, labels[i], { track: out }));
// Creature box of width w whose anchor point sits at (ax, ay); height follows the sprite frame.
const box = (ax: number, ay: number, w: number) => {
  const [cx, cy] = jellyfish.anchor as [number, number];
  const k = w / jellyfish.frame.w;
  return { x: ax - cx * k, y: ay - cy * k, w, h: jellyfish.frame.h * k };
};
const SCREENS = 2.5;
const jelly = <Creature sheet={jellyfish} ms={2400} />;

const ignite = (at: number): LayerDef['track'] => [{ at, opacity: 0 }, { at: at + 0.14, opacity: 1, ease: 'out' }];
const extra: Record<string, LayerDef> = {};
for (const s of ['', '-p']) {
  extra[`lanterns-far${s}`] = { track: ignite(0.1) };
  extra[`lanterns-mid${s}`] = { track: ignite(0.18) };
  extra[`lanterns-near${s}`] = { track: ignite(0.26) };
  extra[`embers${s}`] = { highOnly: true, track: [{ at: 0, y: 0 }, { at: 1, y: -60 }] };
}
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, extra });
const desktop = comp('desktop', [1460, 520]);
const portrait = comp('portrait', [620, 600]);
const drift: LayerDef['track'] = [{ at: 0.2, y: 40, opacity: 0 }, { at: 0.4, y: 0, opacity: 1 }, { at: 0.9, y: -90, opacity: 1 }, { at: 1, y: -110, opacity: 0 }];

export const b6LanternVault: BeatDef = {
  slug: 'b6-lantern-vault',
  screens: SCREENS,
  manifest,
  // focus = the far exit arch
  desktop: {
    ...desktop,
    overlays: [
      ...hang(desktop, [['lanterns-far', { x: 1500, y: 640, w: 360, h: 200 }], ['lanterns-mid', { x: 120, y: 520, w: 520, h: 240 }], ['lanterns-near', { x: 110, y: 760, w: 680, h: 260 }]]),
      { node: jelly, rect: box(1180, 250, 340), parallax: 0.5, track: drift },
      { node: head, className: 'left-[8vw] top-[14vh]', track: reveal() },
    ],
  },
  portrait: {
    ...portrait,
    overlays: [
      ...hang(portrait, [['lanterns-far-p', { x: 560, y: 860, w: 440, h: 220 }], ['lanterns-mid-p', { x: 80, y: 1100, w: 600, h: 260 }], ['lanterns-near-p', { x: 80, y: 1380, w: 900, h: 300 }]]),
      { node: jelly, rect: box(330, 320, 300), parallax: 0.5, track: drift },
      { node: head, className: 'left-[8vw] top-[10svh]', track: reveal() },
    ],
  },
};
