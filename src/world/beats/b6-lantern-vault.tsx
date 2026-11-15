'use client';
// b6: the lantern vault. Choreography from ../transitions. Hero: the lanterns ignite in a depth wave, far to near.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b6-lantern-vault/manifest.json';
import jellyfish from '../../../public/art/creatures/jellyfish/manifest.json';
import { Creature } from '../Creature';
import { useT } from '../lang';
import { At, Kicker } from '../SceneText';
import { reveal, world } from '../transitions';

// Text: one fixed column (pinning it to the dollying lantern layers made it grow off-frame). Each skill
// group is a row of small paper lantern tags that light in turn, far row to near, with the lanterns.
const glowText = '[text-shadow:0_0_14px_rgb(255_170_80/0.75),0_2px_8px_rgb(0_0_0/0.7)]';
function Skills() {
  const t = useT();
  return (
    <div aria-hidden className="flex flex-col gap-[3.2vh] text-[#ffe9c4] portrait:gap-4">
      <div className={`beat-text flex flex-col gap-2 ${glowText}`}>
        <Kicker slug="b6-lantern-vault" />
        <p className="font-display text-[clamp(1rem,1.3vw,1.3rem)] italic opacity-90">{t(scenes.b6Languages)}</p>
      </div>
      {scenes.b6.map((g, i) => {
        const items = (typeof g.items === 'string' ? g.items : t(g.items)).split(' · ');
        const from = 0.14 + 0.08 * i;
        return (
          <section key={i} className="flex flex-col gap-2.5">
            <At a={from} d={0.06} className={`flex items-center gap-3 text-[0.75rem] tracking-[0.3em] uppercase ${glowText}`}>
              <span className="size-2 shrink-0 rounded-full bg-[#ffd27a] shadow-[0_0_12px_4px_rgb(255_190_100/0.8)]" />
              {t(g.label)}
            </At>
            <ul className="flex flex-wrap gap-2">
              {items.map((x, j) => (
                <li key={j}>
                  <At a={from + 0.012 * j} d={0.05} className="block rounded-full border border-[#ffd27a]/45 bg-[#1c0f06]/70 px-3.5 py-1.5 font-display text-[clamp(0.95rem,1.25vw,1.3rem)] leading-tight shadow-[0_0_18px_rgb(255_160_70/0.25)] backdrop-blur-[2px]">
                    {x}
                  </At>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
const skills = <Skills />;
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
      { node: jelly, rect: box(1180, 250, 340), parallax: 0.5, track: drift },
      { node: skills, className: 'left-[10vw] top-[14vh] w-[min(38vw,38rem)]', track: reveal() },
    ],
  },
  portrait: {
    ...portrait,
    overlays: [
      { node: jelly, rect: box(330, 320, 300), parallax: 0.5, track: drift },
      { node: skills, className: 'left-[9vw] right-[9vw] bottom-[8svh]', track: reveal() },
    ],
  },
};
