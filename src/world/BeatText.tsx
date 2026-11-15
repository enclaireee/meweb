'use client';
import { beats, type BeatSlug } from '@/content';
import { useT } from './lang';

/** The one text block every beat shows: small label, one big line, optional facts.
 *  Place it with an engine overlay (className positions it). aria-hidden: screen readers and
 *  no-JS visitors read the same content from <Plain>, in document order. */
export function BeatText({ slug, align = 'left', facts = true }: { slug: BeatSlug; align?: 'left' | 'center' | 'right'; facts?: boolean }) {
  const t = useT();
  const b = beats[slug];
  const a = { left: 'text-left items-start', center: 'text-center items-center', right: 'text-right items-end' }[align];
  return (
    <div aria-hidden className={`beat-text flex w-[var(--bt-w,min(84vw,44rem))] flex-col gap-3 ${a}`}>
      <p className="text-[0.7rem] tracking-[0.35em] uppercase opacity-80">{t(b.label)}</p>
      <p className="font-display text-[clamp(2.1rem,6.2vw,5.25rem)] leading-[1.02] text-balance">{t(b.line)}</p>
      {facts && b.facts && (
        <div className="mt-2 [filter:drop-shadow(0_10px_14px_rgb(0_0_0/0.4))]">
        <ul className="paper-panel flex max-w-[34rem] flex-col gap-2 text-left text-[clamp(0.82rem,1.1vw,0.98rem)] leading-snug">
          {b.facts.map((f, i) => (
            // Static, author-written strings from src/content (may contain <strong>).
            <li key={i} dangerouslySetInnerHTML={{ __html: t(f) }} />
          ))}
        </ul>
        </div>
      )}
    </div>
  );
}
