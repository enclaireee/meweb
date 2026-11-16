'use client';
// Projects lane (Build decisions b): shell exterior intro, then one district beat per group (web, data, hardware).
// Cards are HTML and arrive inline on scroll, one per screen, in each district's calm card area. Art is world-only.
// Adding a project = a registry entry only (the shell has 4 web / 3 data / 3 hardware window slots).
import Image from 'next/image';
import type { BeatDef, Comp, CompositionDef, Keyframe, LayerDef, Manifest, OverlayDef, Rect } from '@/engine';
import { exitLane, scrollToS } from '@/engine';
import { projects, ui, type Project } from '@/content';
import shellJson from '../../../public/art/shell/manifest.json';
import webJson from '../../../public/art/p-web/manifest.json';
import dataJson from '../../../public/art/p-data/manifest.json';
import hwJson from '../../../public/art/p-hardware/manifest.json';
import windows from '../../../public/art/shell/windows.json';
import { useT } from '../lang';
import { merge, reveal, world } from '../transitions';

type Group = Project['group'];
const GROUPS: Group[] = ['web', 'data', 'hardware'];
const byGroup = (g: Group) => projects.filter((p) => p.group === g);

/* ---------- scroll layout (screens) ---------- */
const SHELL = 1.2;
const LEAD = 0.3; // gates part before the first card
const CARD = 0.72; // one card slot: slide in, hold, slide out
const TAIL = 0.3; // last card is gone before the dive into the next district
const SLIDE = 0.14; // slide in / slide out duration (screens)
const screensOf = (g: Group) => LEAD + byGroup(g).length * CARD + TAIL;
const startOf = (g: Group) => SHELL + GROUPS.slice(0, GROUPS.indexOf(g)).reduce((n, x) => n + screensOf(x), 0);

/** Lane-local screen where a project's card is fully shown (deep links, shell windows). */
export function projectS(id: string): number | undefined {
  const p = projects.find((x) => x.id === id);
  if (!p) return undefined;
  return startOf(p.group) + LEAD + byGroup(p.group).indexOf(p) * CARD + CARD / 2;
}

/** Lane-local start screen of the shell and of each district (gates open enough to read), for the section gauge. */
export function districts(): { id: 'shell' | 'web' | 'data' | 'hardware'; s: number }[] {
  return [{ id: 'shell', s: 0 }, ...GROUPS.map((g) => ({ id: g, s: startOf(g) + LEAD + SLIDE }))];
}

/* ---------- card ---------- */
const PAPER_CUT = '[clip-path:polygon(0_0.6%,30%_0,66%_0.8%,100%_0,99.4%_50%,100%_99.4%,60%_100%,24%_99.2%,0_100%,0.5%_48%)]';

// aria-hidden like <BeatText>: screen readers and no-JS visitors get the same content from <Plain>.
// The whole card is one cut paper sheet (ink on cream, 4.5:1+) so it reads on every district palette.
function Card({ p, n, of }: { p: Project; n: number; of: number }) {
  const t = useT();
  const prints = p.media.slice(0, 2);
  return (
    <div aria-hidden className="w-full drop-shadow-[3px_6px_0_rgb(0_0_0/0.35)]">
      <article className={`sheet flex rotate-[-0.8deg] flex-col gap-2.5 px-5 py-4 ${PAPER_CUT}`}>
        <p className="text-label tracking-[0.22em] text-[#5a4a38] uppercase">{t(ui.card.groups[p.group])} · {n} / {of}</p>
        <dl className="text-label grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[#2a2118]">
          <dt className="text-[#5a4a38]">{t(ui.card.period)}</dt>
          <dd>{t(p.period)}</dd>
          <dt className="text-[#5a4a38]">{t(ui.card.role)}</dt>
          <dd>{t(p.role)}</dd>
          {p.tags.length > 0 && (
            <>
              <dt className="text-[#5a4a38]">{t(ui.card.tags)}</dt>
              <dd>{p.tags.join(' · ')}</dd>
            </>
          )}
        </dl>
        <h2 className="font-display text-title font-semibold text-balance break-words">{t(p.title)}</h2>
        <p className="text-lead break-words">{t(p.summary)}</p>
        {p.facts.length > 0 && (
          // portrait card area is under half a phone screen, so facts stay desktop-only (full list in <Plain>)
          <ul className="text-body flex flex-col gap-1.5 break-words portrait:hidden">
            {p.facts.map((f, i) => (
              // Static, author-written strings from src/content (may contain <strong>).
              <li key={i} className="border-l-2 border-[#2a2118]/40 pl-3" dangerouslySetInnerHTML={{ __html: t(f) }} />
            ))}
          </ul>
        )}
        {prints.length > 0 && (
          <div className="flex gap-3 pt-2">
            {prints.map((m, i) => (
              <figure key={m.src} className={`relative min-w-0 flex-1 bg-[#fbf5e6] p-1.5 shadow-[0_4px_10px_rgb(0_0_0/0.3)] ${i % 2 ? 'rotate-[1.6deg]' : 'rotate-[-1.8deg]'}`}>
                <span className="absolute -top-2 left-1/2 z-10 h-4 w-10 -translate-x-1/2 rotate-3 bg-[#d9c58a]/80" />
                <div className="relative aspect-[16/10]">
                  <Image src={m.src} alt={t(m.alt)} fill sizes="(min-width: 1024px) 18vw, 40vw" loading="lazy" className="object-cover" />
                </div>
              </figure>
            ))}
          </div>
        )}
        {p.links.length > 0 && (
          <ul className="text-body flex flex-wrap gap-x-5 gap-y-1">
            {p.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer" tabIndex={-1} className="underline underline-offset-4">{t(l.label)} ↗</a>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

/** Card i of n: one slot of CARD screens. It slides in from the edge (SLIDE), holds, slides back out; slots never overlap.
 *  Opacity only ever steps 0 <-> 1 while the card is off-screen, so no card is ever half-faded; the first keyframe pair
 *  parks the transform at 0 so the frozen transform under reduced motion shows every card in place (they swap at the slot edge). */
function cardTrack(i: number, screens: number, axis: 'x' | 'y', off: number): Keyframe[] {
  const a = (s: number) => s / screens;
  const e = 0.0003;
  const s0 = LEAD + i * CARD;
  const s1 = s0 + CARD;
  return [
    { at: 0, [axis]: 0, opacity: 0 },
    { at: a(s0) - 2 * e, [axis]: 0, opacity: 0 },
    { at: a(s0) - e, [axis]: off, opacity: 0 },
    { at: a(s0), [axis]: off, opacity: 1 },
    { at: a(s0 + SLIDE), [axis]: 0, opacity: 1, ease: 'out' },
    { at: a(s1 - SLIDE), [axis]: 0, opacity: 1 },
    { at: a(s1) - e, [axis]: off, opacity: 1, ease: 'in' },
    { at: a(s1), [axis]: off, opacity: 0 },
  ];
}

/** End of the lane: a real button back to the mountain (exitLane returns to where the visitor left). */
function Back() {
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => exitLane()}
      className="min-h-11 cursor-pointer rounded-full border border-[#ffd27a]/70 bg-[#1b1406]/75 px-6 py-2.5 text-[0.8rem] tracking-[0.25em] text-[#fff2c4] uppercase shadow-[0_0_24px_rgb(255_200_110/0.35)] backdrop-blur-sm transition-[background-color,box-shadow] duration-200 hover:bg-[#3a2a0c]/85 hover:shadow-[0_0_36px_8px_rgb(255_200_110/0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd27a]"
    >
      ← {t(ui.projects.back)}
    </button>
  );
}
const back = <Back />;

/* ---------- districts ---------- */
type DistrictArt = {
  json: { slug: string; compositions: Manifest['compositions']; bytes: number };
  focus: Record<Comp, [number, number]>;
  /** Card area: desktop 40% width (left or right), portrait bottom 55% (art briefs, district rules). */
  side: 'left' | 'right';
  extra: (screens: number) => Record<string, LayerDef>;
  last?: boolean;
};

// Scroll-driven loops (reversible), like b9's breathe: values spread evenly over the beat.
const wave = (vals: number[], key: 'opacity' | 'x', from = 0): Keyframe[] =>
  vals.map((v, i) => ({ at: from + ((1 - from) * i) / (vals.length - 1), [key]: v, ease: 'inOut' as const }));
const both = (o: Record<string, LayerDef>) =>
  Object.fromEntries(Object.entries(o).flatMap(([k, v]) => [[k, v], [`${k}-p`, v]]));

const DISTRICTS: Record<Group, DistrictArt> = {
  web: {
    json: webJson,
    focus: { desktop: [860, 720], portrait: [780, 560] },
    side: 'right',
    // Hero: light-well bloom fills the vellum column as the district settles.
    extra: (sc) => both({
      'well-bloom': { track: [{ at: 0.3 / sc, scale: 0.6, opacity: 0 }, { at: 1.4 / sc, scale: 1, opacity: 1, ease: 'out' }] },
      'light-well': { track: [{ at: 0.3 / sc, opacity: 0.6 }, { at: 1.4 / sc, opacity: 1, ease: 'out' }] },
      dust: { highOnly: true },
    }),
  },
  data: {
    json: dataJson,
    focus: { desktop: [1500, 600], portrait: [560, 480] },
    side: 'left',
    // Hero: the colonnade's reflection ripples (two slice layers cross-fade and drift apart).
    extra: () => {
      const k = 8;
      const hi = Array.from({ length: k }, (_, i) => (i % 2 ? 0.2 : 1));
      const lo = hi.map((v) => 1.2 - v);
      const dx = Array.from({ length: k }, (_, i) => (i % 2 ? 6 : -6));
      return both({
        'reflection-a': { track: merge(wave(hi, 'opacity'), wave(dx, 'x')) },
        'reflection-b': { track: merge(wave(lo, 'opacity'), wave(dx.map((v) => -v), 'x')) },
        dust: { highOnly: true },
      });
    },
  },
  hardware: {
    json: hwJson,
    focus: { desktop: [760, 640], portrait: [560, 600] },
    side: 'right',
    last: true,
    // Hero: a slow pulse runs through the three crystal clusters in turn.
    extra: () => {
      const cycle = [0.3, 1, 0.3, 0.3];
      const seq = (shift: number) => wave(Array.from({ length: 13 }, (_, i) => cycle[(i + 4 - shift) % 4]!), 'opacity');
      return both({ 'pulse-1': { track: seq(0) }, 'pulse-2': { track: seq(1) }, 'pulse-3': { track: seq(2) }, embers: { highOnly: true } });
    },
  },
};

const district = (g: Group): BeatDef => {
  const d = DISTRICTS[g];
  const list = byGroup(g);
  const screens = screensOf(g);
  const manifest = d.json as Manifest;
  const lastS = (LEAD + (list.length - 1) * CARD) / screens;
  const backT: Keyframe[] = [{ at: 0, opacity: 0 }, { at: lastS - 0.0003, opacity: 0 }, { at: lastS, opacity: 1 }]; // with the last card, then stays
  const cards = (className: string, backAt: string, axis: 'x' | 'y', off: number): OverlayDef[] => [
    ...list.map((p, i) => ({ node: <Card p={p} n={i + 1} of={list.length} />, className, track: cardTrack(i, screens, axis, off) })),
    ...(d.last ? [{ node: back, className: backAt, track: backT }] : []),
  ];
  // Gates stop short of fully shut so a gap of art always shows between them (no flat dark frame at the join).
  const comp = (c: Comp) => world(manifest, c, screens, { focus: d.focus[c], last: d.last, close: c === 'desktop' ? 380 : 190, extra: d.extra(screens) });
  const x0 = d.side === 'right' ? 'left-[60vw]' : 'left-[4vw]';
  return {
    slug: d.json.slug,
    screens,
    manifest,
    still: (LEAD + CARD / 2) / screens, // reduced motion: first card shown
    desktop: {
      ...comp('desktop'),
      overlays: cards(`${x0} top-[12svh] w-[min(36vw,36rem)]`, `${x0} bottom-[3svh]`, 'x', d.side === 'right' ? 1600 : -1600),
    },
    portrait: { ...comp('portrait'), overlays: cards('left-[6vw] bottom-[3svh] w-[88vw] max-w-[36rem]', 'left-[6vw] top-[11svh]', 'y', 1400) },
  };
};

/* ---------- shell intro ---------- */
// Each project lights one window of its group's cluster; a click scrolls to its card. Spare slots stay art only.
function WindowButton({ p }: { p: Project }) {
  const t = useT();
  return (
    <button
      type="button"
      aria-label={`${t(ui.projects.open)}: ${t(p.title)}`}
      onClick={() => scrollToS(projectS(p.id)!, { smooth: true })}
      className="absolute inset-0 min-h-11 min-w-11 cursor-pointer rounded-sm transition-[background-color,box-shadow] duration-200 hover:bg-[#ffd27a]/25 hover:shadow-[0_0_28px_8px_rgba(255,210,122,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd27a]"
    />
  );
}

function Intro() {
  const t = useT();
  return (
    <div className="flex w-[min(84vw,26rem)] flex-col gap-3">
      <p className="text-[0.7rem] tracking-[0.35em] uppercase opacity-80">{projects.length} · {GROUPS.map((g) => t(ui.projects.groups[g])).join(' · ')}</p>
      <h2 className="font-display text-[clamp(2.1rem,6.2vw,5.25rem)] leading-[1.02]">{t(ui.projects.intro.heading)}</h2>
      <p className="text-sm opacity-85">{t(ui.projects.intro.hint)}</p>
    </div>
  );
}

const glow = (at: number): LayerDef => ({ track: [{ at, opacity: 0 }, { at: at + 0.12, opacity: 1, ease: 'out' }] });
const shellExtra = both({ 'glow-web': glow(0.05), 'glow-data': glow(0.15), 'glow-hw': glow(0.25) });

const shellComp = (c: Comp, focus: [number, number], className: string): CompositionDef => {
  const slots = windows[c] as (Rect & { group: Group })[];
  const buttons = GROUPS.flatMap((g) => {
    const mine = slots.filter((s) => s.group === g);
    return byGroup(g).flatMap((p, i): OverlayDef[] => {
      const { x, y, w, h } = mine[i] ?? {};
      // ponytail: a group with more projects than slots gets no window for the extras until windows.json grows
      return mine[i] ? [{ node: <WindowButton p={p} />, rect: { x: x!, y: y!, w: w!, h: h! }, track: reveal({ first: true }) }] : [];
    });
  });
  return {
    ...world(shellJson as Manifest, c, SHELL, { focus, first: true, extra: shellExtra }),
    overlays: [{ node: <Intro />, className, track: reveal({ first: true }) }, ...buttons],
  };
};

export const projectBeats: BeatDef[] = [
  {
    slug: 'shell',
    screens: SHELL,
    manifest: shellJson as Manifest,
    still: 0.4,
    desktop: shellComp('desktop', [692, 530], 'left-[62vw] top-[22vh]'),
    portrait: shellComp('portrait', [540, 620], 'left-[8vw] bottom-[8svh]'),
  },
  ...GROUPS.map(district),
];
