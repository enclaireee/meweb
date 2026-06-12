import { capabilities, languages } from "@/content";
import { Marquee } from "@/components/motion/Marquee";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

export function Capabilities() {
  const allItems = capabilities.flatMap((g) => g.items);

  return (
    <section id="capabilities" className="border-t border-border">
      <div className="border-b border-border py-3">
        <Marquee duration={40}>
          {allItems.map((item) => (
            <span key={item} className="annot mx-5 flex items-center gap-5 text-muted">
              {item} <span aria-hidden="true">/</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="grid grid-cols-12 gap-x-4 gap-y-14 px-gutter py-section">
        <div className="col-span-12 lg:col-span-3">
          <p className="annot text-muted">04 — capabilities</p>
          <h2 className="font-display text-title mt-4">
            The
            <br />
            <span className="italic">toolkit.</span>
          </h2>
        </div>

        <Stagger className="col-span-12 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-8 lg:col-span-9">
          {capabilities.map((group, gi) => (
            <StaggerItem key={group.label}>
              <p className="annot text-accent">
                {String(gi + 1).padStart(2, "0")} / {group.label}
              </p>
              <p className="mt-2 font-display italic text-muted">{group.blurb}</p>
              <ul className="mt-6 space-y-1 border-t border-border pt-4">
                {group.items.map((item) => (
                  <li key={item} className="text-lg leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="annot col-span-12 flex flex-wrap gap-x-10 gap-y-2 border-t border-border pt-6 text-muted lg:col-start-4 lg:col-span-9">
          {languages.map((l) => (
            <p key={l.label}>
              {l.label} — {l.level}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
