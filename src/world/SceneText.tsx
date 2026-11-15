'use client';
// Shared pieces for the per-scene text. Every scene sets its own layout; these only give the
// scroll stagger (.at, driven by the engine's --t) and the small label. All aria-hidden: <Plain> carries the content.
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { enterLane, subscribeFrame } from '@/engine';
import { beats, ui, type BeatSlug, type L, type Role } from '@/content';
import { mainBeats } from './beats';
import { projectS } from './lane-projects';
import { useLang, useT } from './lang';

type AtProps = { a: number; d?: number; w?: number; k?: 'lit' | 'stamp' | 'unfurl' | 'focus' | 'one'; className?: string; style?: CSSProperties; children: ReactNode };

/** A piece that arrives at local beat progress `a` over `d`. */
export function At({ a, d, w, k, className = '', style, children }: AtProps) {
  const v = { '--a': a, ...(d !== undefined && { '--d': d }), ...(w !== undefined && { '--w': w }), ...style } as CSSProperties;
  return <span className={`at ${k ?? ''} ${className}`} style={v}>{children}</span>;
}

/** Evenly spaced start times: n pieces between `from` and `to`. */
export const seq = (n: number, from: number, to: number) => Array.from({ length: n }, (_, i) => from + (n > 1 ? ((to - from) * i) / (n - 1) : 0));

/** Shared-slot windows for `k="one"`: n entries, each shown for `w` from `from`, back to back. */
export const slots = (n: number, from: number, w: number, gap = 0.06) => Array.from({ length: n }, (_, i) => from + i * (w + gap));
/** "02 / 03" */
export const count = (i: number, n: number) => `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;

/** The beat's small numbered label ("03 / Experience"). */
export function Kicker({ slug, className = '' }: { slug: BeatSlug; className?: string }) {
  const t = useT();
  return <p className={`text-[0.7rem] tracking-[0.35em] uppercase opacity-80 ${className}`}>{t(beats[slug].label)}</p>;
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
      const i = f.lane === 'main' && f.beat === idx ? at.findIndex((a) => f.t >= a - 0.02 && f.t <= a + w + 0.04) : -1;
      setActive(i);
    });
  }, [slug, at, w]);
  return active;
}

const projectLink =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ffd27a]/70 bg-black/35 px-4 text-[0.72rem] tracking-[0.22em] text-[#fff2c4] uppercase transition-colors hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd27a]';

/** Roles shown one at a time in a shared slot: kicker and dots, period (with a Now stamp), title, org,
 *  stamped numbers, highlights, tool chips and an optional link into the projects lane.
 *  `at`/`w` from `slots()`, computed once at module level. `bottom`: entries sit on the bottom edge. */
export function Spotlight({ slug, roles, at, w, bottom = 'portrait' }: { slug: BeatSlug; roles: Role[]; at: number[]; w: number; bottom?: 'always' | 'portrait' }) {
  const t = useT();
  const { lang } = useLang();
  const active = useActive(slug, at, w);
  const n = roles.length;
  const align = bottom === 'always' ? 'self-end' : 'self-start portrait:self-end';
  return (
    <div className="spot beat-text grid">
      {roles.map((r, i) => {
        const on = active === i;
        return (
          <At key={i} a={at[i]!} d={0.05} w={w} k="one" className={`col-start-1 row-start-1 ${align} ${on ? '' : 'pointer-events-none'}`}>
            <div inert={!on} className="flex flex-col">
              <span aria-hidden><Kicker slug={slug} className="pb-3" /></span>
              <div aria-hidden className="flex items-center justify-between gap-4 text-[0.72rem] tracking-[0.28em] uppercase">
                <span className="flex flex-wrap items-center gap-3">
                  {r.now && <span className="stamp-now">{t(ui.roles.now)}</span>}
                  <span className="opacity-85">{t(r.period)}</span>
                </span>
                <span className="flex gap-1.5" title={count(i, n)}>
                  {roles.map((_, j) => <span key={j} className={`h-1.5 rounded-full bg-current transition-all ${j === i ? 'w-5 opacity-90' : 'w-1.5 opacity-35'}`} />)}
                </span>
              </div>
              <p aria-hidden className="pt-2 font-display text-[clamp(2rem,3.9vw,4.4rem)] leading-[0.98] text-balance portrait:text-[clamp(1.75rem,8.4vw,2.6rem)]">{t(r.title)}</p>
              <p aria-hidden className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[clamp(0.72rem,0.9vw,0.9rem)] font-semibold tracking-[0.2em] uppercase">
                {typeof r.org === 'string' ? r.org : t(r.org)}
                {r.badge && <span className="stamp-award">★ {t(r.badge)}</span>}
              </p>
              {r.stats.length > 0 && (
                <div aria-hidden className="mt-4 flex flex-wrap gap-x-[clamp(1.2rem,2.6vw,2.6rem)] gap-y-3 border-t border-current/30 pt-3 portrait:grid portrait:grid-flow-col portrait:auto-cols-fr portrait:gap-x-4">
                  {r.stats.map((s, j) => (
                    <At key={j} a={at[i]! + 0.015 + 0.025 * j} d={0.05} k="stamp" className="flex min-w-0 max-w-[11rem] flex-col portrait:max-w-none">
                      <span className="font-display text-[clamp(2.4rem,4.4vw,4.8rem)] leading-[0.85] tabular-nums portrait:text-[clamp(2rem,10vw,3rem)]">{lang === 'id' && s.nid ? s.nid : s.n}</span>
                      <span className="pt-1 text-[0.66rem] leading-snug tracking-[0.16em] break-words uppercase opacity-85 portrait:text-[0.6rem] portrait:tracking-[0.08em]">{t(s.unit)}</span>
                    </At>
                  ))}
                </div>
              )}
              <ul aria-hidden className="mt-3 flex max-w-[36rem] flex-col gap-1.5 text-[clamp(0.88rem,1.05vw,1.08rem)] leading-snug">
                {r.points.map((p, j) => (
                  <li key={j} className={`flex gap-2.5 ${j > 0 ? 'portrait:hidden' : ''}`}>
                    <span className="mt-[0.55em] h-px w-3 shrink-0 bg-current opacity-60" />
                    <span className="opacity-90">{t(p)}</span>
                  </li>
                ))}
              </ul>
              {(r.chips || r.project) && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {r.chips?.map((c, j) => <span key={c} aria-hidden className={`chip sheet ${j % 2 ? 'rotate-[1.2deg]' : 'rotate-[-1.4deg]'}`}>{c}</span>)}
                  {r.project && (
                    <a
                      href={`/${lang}/p/${r.project}`}
                      onClick={(e) => { e.preventDefault(); enterLane('projects', { focusId: r.project, s: projectS(r.project!) }); }}
                      className={`${projectLink} ${r.chips ? 'ml-1' : ''}`}
                    >
                      {t(ui.roles.project)} →
                    </a>
                  )}
                </div>
              )}
            </div>
          </At>
        );
      })}
    </div>
  );
}
