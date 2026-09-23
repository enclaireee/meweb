import { ramp, ui } from "@/design/tokens";
import { devOnly } from "../devOnly";

export const metadata = { title: "Tokens", robots: { index: false } };

/** Token sheet (architecture.md §14, phase 1): both lights side by side. */
export default function Page() {
  devOnly();
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {(["night", "morning"] as const).map((mode) => (
        <section key={mode} data-light={mode} className="p-10" style={{ background: "var(--stage)" }}>
          <div className="paper grain p-8" style={{ clipPath: "var(--clip-plate)" }}>
            <p className="text-kicker uppercase text-ink-soft">{mode}</p>
            <h1 className="text-hero mt-2">
              Night <span className="text-accent-text">Workshop</span>
            </h1>
            <p className="text-plate-title mt-6">Plate title</p>
            <p className="text-caption italic mt-2">Caption: the voice of the box.</p>
            <p className="text-body mt-2">Body copy. Readable at every size, measure under sixty characters.</p>
            <p className="text-fact mt-4 tabular-nums">4 · 3 · 7.0</p>
            <hr className="perforation my-6" />
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ui[mode]).map(([k, v]) => (
                <div key={k} className="text-caption">
                  <div className="h-10 rounded-sm" style={{ background: v, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / .15)" }} />
                  {k}
                </div>
              ))}
            </div>
            <div className="mt-4 flex">
              {ramp[mode].map((c, i) => (
                <div key={c} className="h-14 flex-1 text-[10px] text-white/80 p-1" style={{ background: c }}>
                  R{i}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
