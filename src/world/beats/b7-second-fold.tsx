'use client';
// b7: the inner mountain unfolds onto dawn (the colour flip). Choreography from ../transitions. Flaps hinge on their outer edge, as in b2.
import type { BeatDef, Comp, Keyframe, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b7-second-fold/manifest.json';
import whale from '../../../public/art/creatures/whale/manifest.json';
import { Creature } from '../Creature';
import { useT } from '../lang';
import { At, Kicker } from '../SceneText';
import { world } from '../transitions';

// Text: the whale's wake. Each award is a glowing mote it leaves on the dark cavern wall, a streak of
// light trailing back toward it, lit one by one as it swims in. The wake bends as it trails off.
const glow = '[text-shadow:0_0_12px_rgb(150_215_255/0.85),0_0_30px_rgb(110_180_255/0.5),0_2px_8px_rgb(0_0_25/0.8)]';
const drift = ['0vw', '3.5vw', '5.5vw', '4.5vw'];
function Awards() {
  const t = useT();
  return (
    <div aria-hidden className={`beat-text flex flex-col gap-[3.4vh] text-[#f2faff] portrait:gap-5 portrait:rounded-3xl portrait:bg-[radial-gradient(ellipse_at_center,rgb(16_20_50/0.8),rgb(16_20_50/0.5)_65%,transparent)] portrait:p-6 ${glow}`}>
      <Kicker slug="b7-second-fold" />
      <ol className="flex flex-col gap-[3.6vh] portrait:gap-4">
        {scenes.b7.map((a, i) => (
          <li key={i} style={{ marginLeft: drift[i] }}>
            <At a={0.34 + 0.08 * i} d={0.07} className="block">
              <span className="flex items-center gap-4">
                <span className="relative size-2.5 shrink-0 rounded-full bg-[#eef9ff] shadow-[0_0_10px_3px_rgb(160_220_255/0.9),0_0_28px_8px_rgb(110_180_255/0.45)]">
                  <span className="absolute top-1/2 right-full h-px w-[8vw] origin-right -translate-y-1/2 bg-linear-to-l from-[#c4e8ff] to-transparent [scale:var(--p)_1]" />
                </span>
                <span className="font-display text-[clamp(1.5rem,2.4vw,2.7rem)] leading-[1.05]">{t(a.title)}</span>
              </span>
              <span className="mt-1.5 block pl-[1.625rem] text-[clamp(0.78rem,0.95vw,0.95rem)] leading-snug text-[#d8eeff]">{t(a.detail)}</span>
            </At>
          </li>
        ))}
      </ol>
    </div>
  );
}
const text = <Awards />;
// In after the flaps start, out before the dive (1 - 0.6 / SCREENS).
const textT: Keyframe[] = [{ at: 0.1, opacity: 0, y: 28 }, { at: 0.22, opacity: 1, y: 0, ease: 'out' }, { at: 0.75, opacity: 1, y: 0 }, { at: 0.82, opacity: 0, y: -20, ease: 'in' }];
// Creature box of width w whose anchor point sits at (ax, ay); height follows the sprite frame.
const box = (ax: number, ay: number, w: number) => {
  const [cx, cy] = whale.anchor as [number, number];
  const k = w / whale.frame.w;
  return { x: ax - cx * k, y: ay - cy * k, w, h: whale.frame.h * k };
};
const SCREENS = 3.5;
const fish = <Creature sheet={whale} ms={5000} />;

const open = (deg: number): LayerDef['track'] => [{ at: 0.22, rotateY: 0 }, { at: 0.6, rotateY: deg, ease: 'inOut' }];
// The crack shows first, then gives way to the flood of dawn as the flaps open.
const crack: LayerDef['track'] = [{ at: 0.1, opacity: 0 }, { at: 0.22, opacity: 1 }, { at: 0.5, opacity: 0, ease: 'in' }];
const extra: Record<string, LayerDef> = {
  'seam-glow': { track: [{ at: 0.12, opacity: 0 }, { at: 0.5, opacity: 1, ease: 'out' }] },
  mist: { track: [{ at: 0, x: 0 }, { at: 1, x: -80 }] },
};
for (const s of ['', '-p']) {
  extra[`inner-flap-l${s}`] = { origin: '0% 50%', track: open(-75) };
  extra[`inner-flap-r${s}`] = { origin: '100% 50%', track: open(75) };
  extra[`seam-light${s}`] = { track: crack };
  extra[`dust${s}`] = { highOnly: true };
}
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, extra });
// Revealed once the flaps pass about 40 degrees, then glides.
const glide: LayerDef['track'] = [{ at: 0.4, x: -60, opacity: 0 }, { at: 0.56, x: -20, opacity: 1 }, { at: 0.92, x: 70, opacity: 1 }, { at: 1, x: 90, opacity: 0 }];

export const b7SecondFold: BeatDef = {
  slug: 'b7-second-fold',
  screens: SCREENS,
  manifest,
  // calm zone is the cavern wall on the right
  desktop: {
    ...comp('desktop', [760, 520]),
    overlays: [
      { node: fish, rect: box(480, 280, 1000), parallax: 0.2, track: glide },
      { node: text, className: 'left-[56vw] top-[16vh] w-[min(36vw,40rem)]', track: textT },
    ],
  },
  portrait: {
    ...comp('portrait', [540, 560]),
    overlays: [
      { node: fish, rect: box(540, 330, 760), parallax: 0.2, track: glide },
      { node: text, className: 'left-[8vw] right-[8vw] bottom-[7svh]', track: textT },
    ],
  },
};
