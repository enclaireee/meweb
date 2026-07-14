/* /dev/tokens — living render of every token. Dev reference, not a site page. */

const colors = [
  { t: "bg", dark: "#0D1013", light: "#F6F7F8", note: "page" },
  { t: "bg-subtle", dark: "#15191D", light: "#E9ECEE", note: "panels" },
  { t: "fg", dark: "#E8ECEF", light: "#16191C", note: "16.1 / 16.5 :1 on bg" },
  { t: "fg-muted", dark: "#9AA6B0", light: "#566069", note: "7.7 / 6.0 :1 on bg" },
  { t: "accent", dark: "#FFB000", light: "#8A5800", note: "10.4 / 5.6 :1 on bg" },
  { t: "accent-fg", dark: "#14171A", light: "#FFFFFF", note: "9.8 / 6.0 :1 on accent" },
  { t: "ok", dark: "#4CC38A", light: "#1A7F37", note: "8.6 / 4.7 :1 on bg" },
  { t: "fail", dark: "#FF6369", light: "#C43C35", note: "6.6 / 4.8 :1 on bg" },
  { t: "border", dark: "fg 14%", light: "fg 16%", note: "hairlines" },
];

const type = [
  { cls: "text-display font-mono font-medium", name: "display", meta: "44→104px · lh 0.95 · ls -0.02em · Plex Mono" },
  { cls: "text-h font-mono font-medium", name: "h", meta: "26→40px · lh 1.15 · ls -0.01em · Plex Mono" },
  { cls: "text-lead", name: "lead", meta: "17→21px · lh 1.5 · Plex Sans" },
  { cls: "text-body", name: "body", meta: "15→16px · lh 1.65 · Plex Sans" },
  { cls: "text-body-s", name: "body-s", meta: "13px · lh 1.55 · Plex Sans" },
  { cls: "label text-fg-muted", name: "label", meta: "11px · ls 0.08em · mono uppercase — the machine-tag voice" },
];

const space = [
  ["s1", 8], ["s2", 12], ["s3", 18], ["s4", 28], ["s5", 40],
  ["s6", 60], ["s7", 92], ["s8", 136], ["s9", 204],
] as const;

const easings = [
  ["out-expo", "var(--ease-out-expo)", "entrances, reveals"],
  ["out-quart", "var(--ease-out-quart)", "hovers, small moves"],
  ["mech", "var(--ease-mech)", "panels, in-out travel"],
  ["step(3)", "steps(3, end)", "discrete readouts"],
] as const;

const durs = [
  ["fast", "var(--dur-fast)", "120ms"],
  ["base", "var(--dur-base)", "240ms"],
  ["slow", "var(--dur-slow)", "400ms"],
  ["page", "var(--dur-page)", "600ms — page transitions only"],
] as const;

function Sheet({ theme }: { theme: "console" | "daylight" }) {
  return (
    <section className="border border-border bg-bg p-gutter text-fg">
      <p className="label text-accent">MODE/{theme === "console" ? "00 — CONSOLE (DARK, DEFAULT)" : "01 — DAYLIGHT OPS (LIGHT)"}</p>

      <h2 className="label mt-s5 text-fg-muted">TOK/COLOR</h2>
      <div className="mt-s2 grid grid-cols-1 gap-px border border-border bg-border-faint sm:grid-cols-3">
        {colors.map((c) => (
          <div key={c.t} className="bg-bg p-s2">
            <div className="h-s5 border border-border" style={{ background: `var(--${c.t})` }} />
            <p className="label mt-s1">{c.t}</p>
            <p className="text-body-s text-fg-muted">{theme === "console" ? c.dark : c.light} · {c.note}</p>
          </div>
        ))}
      </div>

      <h2 className="label mt-s6 text-fg-muted">TOK/TYPE</h2>
      <div className="mt-s2 space-y-s4">
        {type.map((t) => (
          <div key={t.name}>
            <p className={t.cls}>Closed loop 01</p>
            <p className="label mt-s1 text-fg-muted">{t.name} — {t.meta}</p>
          </div>
        ))}
      </div>

      <h2 className="label mt-s6 text-fg-muted">TOK/SPACE — base 8 · ratio 1.5</h2>
      <div className="mt-s2 space-y-s1">
        {space.map(([n, px]) => (
          <div key={n} className="flex items-center gap-s2">
            <span className="label w-s5 text-fg-muted">{n}</span>
            <span className="h-s2 bg-accent" style={{ width: px }} />
            <span className="text-body-s text-fg-muted">{px}px</span>
          </div>
        ))}
      </div>

      <h2 className="label mt-s6 text-fg-muted">TOK/MOTION — durations × easings</h2>
      <div className="mt-s2 space-y-s2">
        {easings.map(([n, fn, use]) => (
          <div key={n} className="flex items-center gap-s3">
            <span className="label w-s7 shrink-0 text-fg-muted">{n}</span>
            <div className="relative h-s2 w-s8 border border-border">
              <span
                className="absolute top-1/2 size-s1 -translate-y-1/2 bg-accent motion-safe:animate-[tok-slide_1.2s_infinite_alternate]"
                style={{ animationTimingFunction: fn }}
              />
            </div>
            <span className="text-body-s text-fg-muted">{use}</span>
          </div>
        ))}
        <div className="flex flex-wrap gap-s3 pt-s2">
          {durs.map(([n, v, note]) => (
            <button
              key={n}
              type="button"
              className="border border-border px-s2 py-s1 text-body-s transition-colors hover:border-accent hover:text-accent"
              style={{ transitionDuration: v }}
            >
              dur-{n} · {note}
            </button>
          ))}
        </div>
        <p className="text-body-s text-fg-muted">
          prefers-reduced-motion collapses every duration token to 1ms — if the
          dots above are frozen, that&apos;s the token layer working.
        </p>
      </div>

      <h2 className="label mt-s6 text-fg-muted">TOK/SURFACE — radius 0 · elevation = border + bg-subtle, never shadow</h2>
      <div className="mt-s2 grid grid-cols-2 gap-s3">
        <div className="border border-border bg-bg p-s3 text-body-s">bg + border</div>
        <div className="border border-border bg-bg-subtle p-s3 text-body-s">bg-subtle + border (raised)</div>
      </div>

      <p className="mt-s6 border-t border-border pt-s3 text-body-s">
        Focus ring: <a className="text-accent underline underline-offset-4" href="#top">tab to me</a> ·
        selection: <span>select this text</span> · status:{" "}
        <span className="text-ok">● NOMINAL</span> <span className="text-fail">● FAULT</span>
      </p>
    </section>
  );
}

export default function TokensPage() {
  return (
    <main id="top" className="mx-auto max-w-console space-y-s5 p-gutter">
      <style>{`@keyframes tok-slide { from { left: 0 } to { left: calc(100% - 0.5rem) } }`}</style>
      <h1 className="label text-fg-muted">DEV/TOKENS — CONTROL ROOM token sheet</h1>
      <Sheet theme="console" />
      <div className="light">
        <Sheet theme="daylight" />
      </div>
    </main>
  );
}
