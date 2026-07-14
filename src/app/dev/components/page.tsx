/* /dev/components — living style guide. Every primitive, every state.
   Hover/focus/active are live (interact); disabled/loading rendered explicitly;
   the second half is wrapped in .light. Reduced motion: Reveal/Marquee freeze. */

import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { Panel } from "@/components/ui/Panel";
import { Tag } from "@/components/ui/Tag";
import { Section } from "@/components/ui/Section";
import { Prose } from "@/components/ui/Prose";
import { Tooltip } from "@/components/ui/Tooltip";
import { Dialog } from "@/components/ui/Dialog";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Reveal } from "@/components/motion/Reveal";
import { Marquee } from "@/components/motion/Marquee";

function Guide() {
  return (
    <div className="space-y-s6 border border-border bg-bg p-gutter text-fg">
      <Section tag="CMP/01 — BUTTON" aside="hover = inverse video">
        <div className="flex flex-wrap items-center gap-s3">
          <Button>SOLID</Button>
          <Button variant="outline">OUTLINE</Button>
          <Button loading>LOADING</Button>
          <Button disabled>DISABLED</Button>
          <Button href="/dev/tokens" variant="outline">AS LINK →</Button>
        </div>
      </Section>

      <Section tag="CMP/02 — LINK">
        <p className="max-w-[60ch]">
          Inline <Link href="/dev/tokens">internal link</Link> and an{" "}
          <Link href="https://github.com/enclaireee">external link</Link> — hover
          flips to inverse video; external gets the departure mark.
        </p>
      </Section>

      <Section tag="CMP/03 — PANEL / TAG">
        <div className="grid gap-s3 sm:grid-cols-2">
          <Panel tag="PROC/01" aside="● NOMINAL">
            <p className="text-body-s">
              A labeled instrument panel. Elevation is border + bg-subtle — no
              shadow anywhere on this site.
            </p>
            <div className="mt-s2 flex gap-s1">
              <Tag>PYTHON</Tag>
              <Tag>ZABBIX</Tag>
              <Tag accent>FEATURED</Tag>
            </div>
          </Panel>
          <Panel tag="PROC/02" aside={<span className="text-fail">● FAULT</span>}>
            <p className="text-body-s text-fg-muted">
              Status colors appear only where status is real.
            </p>
          </Panel>
        </div>
      </Section>

      <Section tag="CMP/04 — PROSE" title="Long-form voice">
        <Prose>
          <p>
            Case-study copy runs in Plex Sans at 65ch. It can carry{" "}
            <strong>emphasis</strong>, <code>inline_code</code>, and structure:
          </p>
          <ul>
            <li>square bullets, accent-marked</li>
            <li>nothing decorative</li>
          </ul>
          <blockquote>Constraints are the interesting part.</blockquote>
          <pre>
            <code>{`ratio = low_beta / theta  # the control variable`}</code>
          </pre>
        </Prose>
      </Section>

      <Section tag="CMP/05 — TOOLTIP / DIALOG / TOGGLE">
        <div className="flex flex-wrap items-center gap-s4">
          <Tooltip tip="SIG/EXPLAIN — works on focus too">
            <Button variant="outline">HOVER ME</Button>
          </Tooltip>
          <Dialog trigger={<Button variant="outline">OPEN DIALOG</Button>} tag="DLG/01">
            <p className="text-body-s">
              Native &lt;dialog&gt; under the styling: Esc, backdrop click, and
              focus trapping come from the platform.
            </p>
          </Dialog>
          <ThemeToggle />
        </div>
      </Section>

      <Section tag="CMP/06 — REVEAL / MARQUEE" aside="freeze under reduced motion">
        <Reveal>
          <Panel tag="REV/01">
            <p className="text-body-s">Slid in on scroll (out-expo, 400ms, once).</p>
          </Panel>
        </Reveal>
        <Marquee duration="20s" className="mt-s3 border-y border-border py-s2">
          {["CONTROL SYSTEMS", "EMBEDDED", "SCADA/OT", "FULL-STACK", "SIGNALS"].map(
            (t) => (
              <span key={t} className="label mx-s4 text-fg-muted">
                {t} <span className="text-accent">▪</span>
              </span>
            ),
          )}
        </Marquee>
      </Section>
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <main className="mx-auto max-w-console space-y-s5 p-gutter">
      <h1 className="label text-fg-muted">
        DEV/COMPONENTS — primitives in every state. Cursor & CommandMenu are
        Phase 6 candidates, built only if picked.
      </h1>
      <Guide />
      <div className="light">
        <Guide />
      </div>
    </main>
  );
}
