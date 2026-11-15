'use client';
// Shared pieces for the per-scene text. Every scene sets its own layout; these only give the
// scroll stagger (.at, driven by the engine's --t) and the small label. All aria-hidden: <Plain> carries the content.
import type { CSSProperties, ReactNode } from 'react';
import { beats, type BeatSlug, type L } from '@/content';
import { useT } from './lang';

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
