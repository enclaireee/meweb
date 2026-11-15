'use client';
// Projects lane (Build decisions b): shell exterior intro, then one district beat per group (web, data, hardware).
// Cards are HTML and arrive inline on scroll, one per screen, in each district's calm card area. Art is world-only.
// Adding a project = a registry entry only (the shell has 4 web / 3 data / 3 hardware window slots).
import type { BeatDef, Comp, CompositionDef, Keyframe, LayerDef, Manifest, OverlayDef, Rect } from '@/engine';
import { scrollToS } from '@/engine';
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
const SHELL = 2;
const LEAD = 0.5; // gates part before the first card
const CARD = 1; // one card per screen
const TAIL = 0.6; // last card leaves before the dive
const screensOf = (g: Group) => LEAD + byGroup(g).length * CARD + TAIL;
const startOf = (g: Group) => SHELL + GROUPS.slice(0, GROUPS.indexOf(g)).reduce((n, x) => n + screensOf(x), 0);

/** Lane-local screen where a project's card is fully shown (deep links, shell windows). */
export function projectS(id: string): number | undefined {
  const p = projects.find((x) => x.id === id);
  if (!p) return undefined;
  return startOf(p.group) + LEAD + byGroup(p.group).indexOf(p) * CARD + 0.35;
}

/* ---------- card ---------- */
// aria-hidden like <BeatText>: screen readers and no-JS visitors get the same content from <Plain>.
function Card({ p, n, of }: { p: Project; n: number; of: number }) {
  const t = useT();
  return (
    <div aria-hidden className="flex w-full flex-col items-start gap-4">
      {/* Museum tag: the metadata on a small cut of paper; the title and story sit bare on the art. */}
      <div className="drop-shadow-[2px_5px_0_rgb(0_0_0/0.35)]">
        <dl className="sheet grid rotate-[-1.4deg] grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 px-4 py-3 text-[0.72rem] leading-snug [clip-path:polygon(0_0,100%_2%,99%_100%,1%_97%)]">
          <dt className="col-span-2 mb-1 tracking-[0.3em] uppercase">{t(ui.card.groups[p.group])} · {n} / {of}</dt>
          <dt className="opacity-60">{t(ui.card.period)}</dt>
          <dd>{t(p.period)}</dd>
          <dt className="opacity-60">{t(ui.card.role)}</dt>
          <dd>{t(p.role)}</dd>
          {p.tags.length > 0 && (
            <>
              <dt className="opacity-60">{t(ui.card.tags)}</dt>
              <dd className="max-w-[22rem]">{p.tags.join(' · ')}</dd>
            </>
          )}
        </dl>
      </div>
      <article className="beat-text flex flex-col gap-3">
        <h2 className="font-display text-[clamp(2rem,4vw,4rem)] leading-[1] text-balance break-words">{t(p.title)}</h2>
        <p className="font-display text-[clamp(1rem,1.4vw,1.35rem)] leading-snug break-words italic">{t(p.summary)}</p>
        {p.facts.length > 0 && (
          // ponytail: portrait card area is ~half a phone screen, so facts stay desktop-only (full list in <Plain>)
          <ul className="flex flex-col gap-1.5 text-[clamp(0.8rem,1vw,0.95rem)] leading-snug break-words portrait:hidden">
            {p.facts.map((f, i) => (
              // Static, author-written strings from src/content (may contain <strong>).
              <li key={i} className="border-l border-current/40 pl-3" dangerouslySetInnerHTML={{ __html: t(f) }} />
            ))}
          </ul>
        )}
        {p.media[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.media[0].src} alt="" loading="lazy" className="h-auto max-h-[22vh] max-w-full rotate-[0.8deg] border-[6px] border-[#efe4cc] object-cover shadow-[0_10px_20px_rgb(0_0_0/0.4)]" />
        )}
        {p.links.length > 0 && (
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm tracking-wide">
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

/** Card i of n in a district of `screens`: rises in, holds for its screen, leaves (the last one holds until the dive). */
function cardTrack(i: number, n: number, screens: number): Keyframe[] {
  const a = (s: number) => s / screens;
  const s0 = LEAD + i * CARD;
  const out = i === n - 1 ? screens - TAIL : s0 + CARD;
  return [
    { at: a(s0 - 0.15), opacity: 0, y: 60 },
    { at: a(s0 + 0.12), opacity: 1, y: 0, ease: 'out' },
    { at: a(out - 0.22), opacity: 1, y: 0 },
    { at: a(out), opacity: 0, y: -60, ease: 'in' },
  ];
}

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
  const cards = (className: string): OverlayDef[] =>
    list.map((p, i) => ({ node: <Card p={p} n={i + 1} of={list.length} />, className, track: cardTrack(i, list.length, screens) }));
  const comp = (c: Comp) => world(manifest, c, screens, { focus: d.focus[c], last: d.last, extra: d.extra(screens) });
  return {
    slug: d.json.slug,
    screens,
    manifest,
    still: LEAD / screens + 0.05, // reduced motion: first card shown
    desktop: {
      ...comp('desktop'),
      overlays: cards(`${d.side === 'right' ? 'left-[62vw]' : 'left-[5vw]'} top-[13vh] w-[min(33vw,34rem)]`),
    },
    portrait: { ...comp('portrait'), overlays: cards('left-[8vw] bottom-[6svh] w-[84vw] max-w-[34rem]') },
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
