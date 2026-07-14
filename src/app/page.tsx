import { Link as TransitionLink } from "next-view-transitions";
import { profile } from "@content/meta/profile";
import { getProjects, getExperience, getSkills } from "@/lib/content";
import { Section } from "@/components/ui/Section";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";

const proc = (i: number) => `PROC/${String(i + 1).padStart(2, "0")}`;

export default function Home() {
  const projects = getProjects();
  const experience = getExperience();
  const capabilities = getSkills();
  return (
    <div className="space-y-s7 pb-s7">
      {/* HERO — the operator card */}
      <section className="flex min-h-[80svh] flex-col justify-center gap-s5 pt-s6">
        <Reveal>
          <p className="label text-fg-muted">
            SYS<span className="text-accent">/</span>OPERATOR — {profile.location.toUpperCase()}
          </p>
          <h1 className="mt-s3 font-mono text-display font-medium">
            MUHAMMAD
            <br />
            FATIH ZAMZAMI<span className="text-accent">_</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-[46ch] text-lead text-fg-muted">{profile.heroLine}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-wrap gap-x-s5 gap-y-s2 border-y border-border py-s3">
            {[
              ["ROLE", profile.role],
              ["EDU", "Universitas Indonesia — EE"],
              ["NOW", "SCADA intern @ PGNCOM"],
            ].map(([k, v]) => (
              <p key={k} className="text-body-s">
                <span className="label text-fg-muted">{k} </span>
                <span className="font-mono">{v}</span>
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* SELECTED WORK */}
      <Section tag="PROC — SELECTED WORK" aside={`${projects.length} RUNNING`}>
        <div className="grid gap-s3 lg:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 0.08}>
              <NextCase i={i} slug={p.slug}>
                <Panel
                  tag={proc(i)}
                  aside={
                    <span className={p.status === "shipped" ? "text-ok" : "text-accent"}>
                      ● {p.status === "shipped" ? "SHIPPED" : "RUNNING"}
                    </span>
                  }
                  className="h-full transition-colors dur-base hover:border-accent"
                  bodyClassName="flex h-full flex-col gap-s2"
                >
                  <h3 className="font-mono text-h font-medium">{p.title}</h3>
                  <p className="text-body-s text-fg-muted">{p.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-s1 pt-s2">
                    {p.stack.map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                  <p className="label text-accent">READ CASE →</p>
                </Panel>
              </NextCase>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CAPABILITIES STRIP */}
      <Marquee duration="35s" className="border-y border-border py-s2">
        {capabilities.flatMap((g) => g.items).map((item) => (
          <span key={item} className="label mx-s4 text-fg-muted">
            {item.toUpperCase()} <span className="text-accent">▪</span>
          </span>
        ))}
      </Marquee>

      {/* EXPERIENCE LOG */}
      <Section tag="LOG — EXPERIENCE" aside={<Link href="/about">FULL RECORD →</Link>}>
        <ol className="divide-y divide-border border-y border-border">
          {experience.map((e) => (
            <li key={e.slug} className="grid gap-s1 py-s3 sm:grid-cols-[1fr_auto] sm:gap-s3">
              <div>
                <p className="font-mono text-body font-medium">{e.role}</p>
                <p className="text-body-s text-fg-muted">{e.org}</p>
              </div>
              <p className="label self-start text-fg-muted sm:self-center">
                {e.start} — {e.end ?? <span className="text-ok">NOW</span>}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* STATEMENT + CONTACT CLOSE */}
      <Section tag="COMM — CONTACT">
        <Reveal>
          <p className="max-w-[38ch] font-mono text-h font-medium">{profile.statement}</p>
          <div className="mt-s6">
            <CopyEmail />
          </div>
          <div className="mt-s5 flex flex-wrap gap-s3">
            <Button href={`mailto:${profile.email}`}>SEND EMAIL</Button>
            {profile.socials.map((s) => (
              <Button key={s.label} variant="outline" href={s.url}>
                {s.label.toUpperCase()} ↗
              </Button>
            ))}
          </div>
        </Reveal>
      </Section>
    </div>
  );
}

/** Whole-card link wrapper — keeps Panel a pure primitive. */
function NextCase({ slug, i, children }: { slug: string; i: number; children: React.ReactNode }) {
  return (
    <TransitionLink href={`/work/${slug}`} aria-label={`Case study ${i + 1}`} className="block h-full">
      {children}
    </TransitionLink>
  );
}
