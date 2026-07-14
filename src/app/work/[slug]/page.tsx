import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link as TransitionLink } from "next-view-transitions";
import { projects } from "@/content";
import { Prose } from "@/components/ui/Prose";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return p
    ? { title: `${p.title} — Muhammad Fatih Zamzami`, description: p.tagline }
    : {};
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <div className="pt-s6 pb-s7">
      {/* intro */}
      <header className="border-b border-border pb-s5">
        <p className="label text-fg-muted">
          PROC/{String(i + 1).padStart(2, "0")} —{" "}
          <span className={p.status === "shipped" ? "text-ok" : "text-accent"}>
            ● {p.status === "shipped" ? "SHIPPED" : "RUNNING"}
          </span>
        </p>
        <h1 className="mt-s3 font-mono text-display font-medium">{p.title}</h1>
        <p className="mt-s3 max-w-[46ch] text-lead text-fg-muted">{p.tagline}</p>
      </header>

      {/* body + specifics rail */}
      <div className="mt-s5 grid gap-s5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Prose>
          {p.description.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
          <h2>Specifics</h2>
          <ul>
            {p.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Prose>

        <Reveal className="lg:sticky lg:top-s7">
          <Panel tag="SPEC" aside={p.year}>
            <dl className="space-y-s3 text-body-s">
              <div>
                <dt className="label text-fg-muted">TIMEFRAME</dt>
                <dd className="mt-s1 font-mono">{p.timeframe}</dd>
              </div>
              <div>
                <dt className="label text-fg-muted">DOMAIN</dt>
                <dd className="mt-s1 font-mono">{p.domain}</dd>
              </div>
              <div>
                <dt className="label text-fg-muted">STACK</dt>
                <dd className="mt-s1 flex flex-wrap gap-s1">
                  {p.stack.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="label text-fg-muted">CV RECORD</dt>
                <dd className="mt-s1 text-fg-muted">{p.cvName}</dd>
              </div>
            </dl>
          </Panel>
        </Reveal>
      </div>

      {/* next case */}
      <TransitionLink
        href={`/work/${next.slug}`}
        className="group mt-s7 block border border-border p-s4 transition-colors dur-base hover:border-accent"
      >
        <p className="label text-fg-muted">
          NEXT/PROC — {String(((i + 1) % projects.length) + 1).padStart(2, "0")}
        </p>
        <p className="mt-s2 font-mono text-h font-medium transition-colors dur-fast group-hover:text-accent">
          {next.title} →
        </p>
      </TransitionLink>
    </div>
  );
}
