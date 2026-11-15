'use client';
import { beats, profile, projects, ui, type BeatSlug } from '@/content';
import { useT } from './lang';

/** The whole site as plain, ordered HTML. Visible without JS; screen-reader-only once the stage runs. */
export function Plain() {
  const t = useT();
  const c = profile.contact;
  const contact = [
    c.email && { label: t(ui.contact.email), href: `mailto:${c.email}` },
    c.linkedin && { label: t(ui.contact.linkedin), href: c.linkedin },
    c.github && { label: t(ui.contact.github), href: c.github },
    c.cv && { label: t(ui.contact.cv), href: c.cv },
  ].filter((x): x is { label: string; href: string } => !!x);
  return (
    <main id="content" className="plain mx-auto flex max-w-2xl flex-col gap-10 px-6 py-16">
      <h1 className="font-display text-4xl">{profile.name}</h1>
      <p>{t(profile.bio)}</p>
      {(Object.keys(beats) as BeatSlug[]).map((slug) => (
        <section key={slug}>
          <h2 className="font-display text-2xl">{t(beats[slug].line)}</h2>
          <p className="text-sm opacity-70">{t(beats[slug].label)}</p>
          {beats[slug].facts && (
            <ul className="mt-2 list-disc pl-5">
              {beats[slug].facts!.map((f, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: t(f) }} />
              ))}
            </ul>
          )}
        </section>
      ))}
      <section>
        <h2 className="font-display text-2xl">{t(ui.plain.projects)}</h2>
        {projects.map((p) => (
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
              <a key={l.href} href={l.href} className="mr-4 underline">
                {t(l.label)}
              </a>
            ))}
          </article>
        ))}
      </section>
      <section>
        <h2 className="font-display text-2xl">{t(ui.plain.contact)}</h2>
        <ul>
          {contact.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="underline">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
