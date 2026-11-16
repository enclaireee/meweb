'use client';
// Shared pieces for the per-scene text. Every scene sets its own layout; these give the scroll stagger (.at, driven
// by the engine's --t), masked line reveals for shared slots (k="one" + <Ln>/<Lines>), the small label, the
// in-scene section heading and the one-role Spotlight. All aria-hidden: <Plain> carries the content.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { enterLane, subscribeFrame } from '@/engine';
import { beats, ui, type BeatSlug, type L, type Role } from '@/content';
import { mainBeats } from './beats';
import { projectS } from './lane-projects';
import { useLang, useT } from './lang';
import { D, seq } from './slots';

export { count, seq, slots } from './slots';

type AtProps = { a: number; d?: number; w?: number; k?: 'lit' | 'stamp' | 'unfurl' | 'focus' | 'one' | 'rise'; className?: string; style?: CSSProperties; children: ReactNode };

/** A piece that arrives at local beat progress `a` over `d`.
 *  k="one": a shared-slot entry, shown only inside [a, a + w]. Its rows (<Ln>, <Lines>) slide up from behind a clip
 *  mask on enter and leave upward the same way; anything outside a row pops with the entry. Never faded. */
export function At({ a, d, w, k, className = '', style, children }: AtProps) {
  const v = { '--a': a, ...(d !== undefined && { '--d': d }), ...(w !== undefined && { '--w': w }), ...style } as CSSProperties;
  return <span className={`at ${k ?? ''} ${className}`} style={v}>{children}</span>;
}

/** One masked row of a slot entry (or of an `At k="rise"`). `i` = row index for the enter cascade. */
export function Ln({ i = 0, className = '', children }: { i?: number; className?: string; children: ReactNode }) {
  return (
    <span className={`ln ${className}`} style={{ '--i': i } as CSSProperties}>
      <span className="ln-in">{children}</span>
    </span>
  );
}

/** Text revealed line by line: every word is its own clip mask (inline-block), and words on the same rendered line
 *  share one cascade index, so each line slides up as a unit. Line indices are measured on mount, resize and
 *  text change (never per frame) and written as --i on the words; no React state. */
export function Lines({ text, i = 0, className = '' }: { text: string; i?: number; className?: string }) {
  const box = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const assign = () => {
      let top = NaN, row = -1;
      for (const w of el.querySelectorAll<HTMLElement>('[data-w]')) {
        if (w.offsetTop !== top) {
          top = w.offsetTop;
          row++;
        }
        w.style.setProperty('--i', String(i + row));
      }
    };
    assign();
    const ro = new ResizeObserver(assign);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, i]);
  const words = text.split(' ').filter(Boolean);
  return (
    <span ref={box} className={`block ${className}`}>
      {words.map((wd, j) => (
        <span key={j}>
          <span data-w="" className="ln ln-w" style={{ '--i': i } as CSSProperties}><span className="ln-in">{wd}</span></span>
          {j < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

/** The beat's small numbered label ("03 / Experience"). */
export function Kicker({ slug, className = '' }: { slug: BeatSlug; className?: string }) {
  const t = useT();
  return <p className={`text-label font-semibold tracking-[0.3em] uppercase ${className}`}>{t(beats[slug].label)}</p>;
}

/** Section heading set IN the scene (Build decisions c, item 3): place it with
 *  `onLayer(comp, <layer>, rect, <SectionHeading/>, { behind: true, track })` and the composition's `split`, so at
 *  least one sheet passes in front of it, like the name in b0. Sized by its rect (container units). */
export function SectionHeading({ slug, className = '', size = 'text-display', align = 'start' }: { slug: BeatSlug; className?: string; size?: string; align?: 'start' | 'end' | 'center' }) {
  const t = useT();
  const items = { start: 'items-start', end: 'items-end', center: 'items-center' }[align];
  return (
    <div aria-hidden className={`@container flex h-full flex-col justify-end ${items} ${className}`}>
      <p className={`font-display ${size} font-semibold whitespace-nowrap uppercase [text-shadow:0_2px_24px_rgb(0_0_0/0.35)]`}>{t(beats[slug].line)}</p>
    </div>
  );
}

/** Words that light up one by one between `from` and `to`; *word* is emphasised. */
export function Words({ text, from, to, emClass = '' }: { text: L; from: number; to: number; emClass?: string }) {
  const t = useT();
  // Emphasis spans words: split on the markers first, so odd chunks are *emphasised*.
  const words = t(text).split('*').flatMap((chunk, c) => chunk.split(' ').filter(Boolean).map((w) => ({ w, on: c % 2 === 1 })));
  const at = seq(words.length, from, to);
  return words.map(({ w, on }, i) => (
    <At key={i} a={at[i]!} d={0.04} k="lit" className={on ? emClass : ''}>
      {w}{i < words.length - 1 ? ' ' : ''}
    </At>
  ));
}

/* ---------- Spotlight: one role at a time (b3, b4, b8) ---------- */

/** Index of the slot on screen now (-1 = none). Only the shown role is clickable/focusable: they all share one grid cell. */
function useActive(slug: BeatSlug, at: number[], w: number) {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    const idx = mainBeats.findIndex((b) => b.slug === slug);
    return subscribeFrame((f) => {
      const i = f.lane === 'main' && f.beat === idx ? at.findIndex((a) => f.t > a && f.t < a + w + D) : -1;
      setActive(i);
    });
  }, [slug, at, w]);
  return active;
}

const projectLink =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ffd27a]/70 bg-black/35 px-4 text-label font-semibold tracking-[0.2em] text-[#fff2c4] uppercase transition-colors hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd27a]';
const projectLinkInk =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-[#2a2118]/60 bg-[#2a2118]/5 px-4 text-label font-semibold tracking-[0.2em] text-[#2a2118] uppercase transition-colors hover:bg-[#2a2118]/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a380d]';

/** Roles shown one at a time in a shared slot, trimmed for the main lane (Build decisions c): kicker and dots,
 *  period (with a Now stamp), title, org, ONE headline stat, ONE line, and the project link. Full facts stay in
 *  <Plain> and the cards. Each row is a masked line. `paper`: set the role on a paper card (where art behind it
 *  is too busy for bare text). `at`/`w` from `slots()`, computed once at module level. */
export function Spotlight({ slug, roles, at, w, bottom = 'portrait', paper = false, tone = 'light' }: {
  slug: BeatSlug; roles: Role[]; at: number[]; w: number; bottom?: 'always' | 'portrait' | 'never'; paper?: boolean | 'portrait'; tone?: 'light' | 'ink';
}) {
  const t = useT();
  const { lang } = useLang();
  const active = useActive(slug, at, w);
  const n = roles.length;
  const align = { always: 'self-end', portrait: 'self-start portrait:self-end', never: 'self-start' }[bottom];
  const card = paper === true ? 'paper-card' : paper === 'portrait' ? 'portrait:paper-card' : '';
  const ink = paper === true || tone === 'ink';
  return (
    <div className={`grid ${ink ? 'text-[#2a2118]' : 'beat-text'}`}>
      {roles.map((r, i) => {
        const on = active === i;
        const s = r.stats[0];
        const point = r.points[0];
        return (
          <At key={i} a={at[i]!} d={D} w={w} k="one" className={`col-start-1 row-start-1 ${align} ${on ? '' : 'pointer-events-none'}`}>
            <div inert={!on} className={`flex max-w-[38rem] flex-col ${card}`}>
              <Ln i={0}><span aria-hidden><Kicker slug={slug} className="pb-2" /></span></Ln>
              <Ln i={1}>
                <span aria-hidden className="flex items-center justify-between gap-4 text-label font-semibold tracking-[0.24em] uppercase">
                  <span className="flex flex-wrap items-center gap-3">
                    {r.now && <span className="stamp-now">{t(ui.roles.now)}</span>}
                    <span>{t(r.period)}</span>
                  </span>
                  <span className="flex gap-1.5" title={`${i + 1} / ${n}`}>
                    {roles.map((_, j) => <span key={j} className={`h-1.5 rounded-full bg-current ${j === i ? 'w-5 opacity-90' : 'w-1.5 opacity-40'}`} />)}
                  </span>
                </span>
              </Ln>
              <span aria-hidden className="block pt-2 font-display text-title font-semibold text-balance">
                <Lines text={t(r.title)} i={2} />
              </span>
              <Ln i={4}>
                <span aria-hidden className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-label font-semibold tracking-[0.2em] uppercase">
                  {typeof r.org === 'string' ? r.org : t(r.org)}
                  {r.badge && <span className="stamp-award">★ {t(r.badge)}</span>}
                </span>
              </Ln>
              {s && (
                <Ln i={5}>
                  <span aria-hidden className={`mt-3 flex items-baseline gap-3 border-t pt-3 ${ink ? 'border-[#2a2118]/30' : 'border-current/35'}`}>
                    <span className="font-display text-title font-semibold tabular-nums">{lang === 'id' && s.nid ? s.nid : s.n}</span>
                    <span className="text-body leading-snug">{t(s.unit)}</span>
                  </span>
                </Ln>
              )}
              {point && (
                <Ln i={6}>
                  <span aria-hidden className={`block text-body ${s ? 'pt-2' : 'mt-3 border-t pt-3'} ${ink ? 'border-[#2a2118]/30' : 'border-current/35'}`}>{t(point)}</span>
                </Ln>
              )}
              {r.project && (
                <Ln i={7} className="mt-3">
                  <a
                    href={`/${lang}/p/${r.project}`}
                    onClick={(e) => { e.preventDefault(); enterLane('projects', { focusId: r.project, s: projectS(r.project!) }); }}
                    className={ink ? projectLinkInk : projectLink}
                  >
                    {t(ui.roles.project)} →
                  </a>
                </Ln>
              )}
            </div>
          </At>
        );
      })}
    </div>
  );
}
