'use client';
import { useSyncExternalStore } from 'react';
import { beats, profile, projects, ui, type BeatSlug } from '@/content';
import { useT } from './lang';

const noop = () => () => {};
/** true once hydrated (the stage runs): false on the server and in no-JS. */
const useJs = () => useSyncExternalStore(noop, () => true, () => false);
/** "03 / Experience · Engineering" -> "Experience · Engineering" */
const strip = (label: string) => label.replace(/^\s*\d+\s*\/\s*/, '');

/** The whole site as plain, ordered HTML, in journey order. Visible without JS; once the stage runs it is
 *  screen-reader-only and its links leave the tab order (the stage's own controls carry keyboard use; screen
 *  readers still reach these links with their reading cursor). */
export function Plain() {
  const t = useT();
  const tab = useJs() ? -1 : undefined;
  const c = profile.contact;
  const contact = [
    c.email && { label: t(ui.contact.email), href: `mailto:${c.email}` },
    c.linkedin && { label: t(ui.contact.linkedin), href: c.linkedin },
    c.github && { label: t(ui.contact.github), href: c.github },
    c.cv && { label: t(ui.contact.cv), href: c.cv },
  ].filter((x): x is { label: string; href: string } => !!x);
  const slugs = (Object.keys(beats) as BeatSlug[]).filter((s) => s !== 'b0-outside');
  // Two beats share a section name (Experience): their headings use the beat label, which names the part.
  const dup = (slug: BeatSlug) => slugs.filter((s) => t(beats[s].line) === t(beats[slug].line)).length > 1;
  return (
    <main id="content" className="plain mx-auto flex max-w-2xl flex-col gap-10 px-6 py-16">
      <h1 className="font-display text-4xl">{profile.name}</h1>
      <p>{t(profile.bio)}</p>
      {beats['b0-outside'].facts && (
        <ul className="list-disc pl-5">
          {beats['b0-outside'].facts.map((f, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: t(f) }} />
          ))}
        </ul>
      )}
      {slugs.map((slug) => (
        <section key={slug}>
          <h2 className="font-display text-2xl">{dup(slug) ? strip(t(beats[slug].label)) : t(beats[slug].line)}</h2>
          {beats[slug].facts && (
            <ul className="mt-2 list-disc pl-5">
              {beats[slug].facts!.map((f, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: t(f) }} />
              ))}
            </ul>
          )}
          {slug === 'b5-understory' &&
            projects.map((p) => (
              <article key={p.id} id={`p-${p.id}`} className="mt-6">
                <h3 className="text-lg font-semibold">{t(p.title)}</h3>
                <p className="text-sm opacity-70">
                  {t(p.role)} · {t(p.period)}
                </p>
                <p className="mt-1">{t(p.summary)}</p>
                <ul className="mt-1 list-disc pl-5">
                  {p.facts.map((f, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: t(f) }} />
                  ))}
                </ul>
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} tabIndex={tab} className="mr-4 underline">
                    {t(l.label)}
                  </a>
                ))}
              </article>
            ))}
          {slug === 'b9-window' && (
            <ul className="mt-2">
              {contact.map((l) => (
                <li key={l.href}>
                  <a href={l.href} tabIndex={tab} className="underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
