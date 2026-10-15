"use client";
// The projects as a night market (pasar malam), walked into depth. Native vertical scroll on a spacer of one opening per
// step (gate; per stall 1 walk + 3 scene changes; pier) under a sticky stage. Per scroll frame the only JS writes are --v (steps
// past the gate) and --z (camera depth, -1 at the gate .. 5 at the pier, held at each stall while its shadow play runs) on the
// root; every set piece reads its own depth --n and places itself in CSS (Market.module.css).
// Set pieces are drawn at their nearest size and only ever shrink (scale <= 1); nothing inside them changes while walking.
import { useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type Ref } from "react";
import manifest from "../../../public/art/market/manifest.json";
import type { MarketManifest, Rect } from "../../../art/market/types";
import { copy, projects, type Stop } from "@/content/site";
import type { Layout } from "@/lib/layout";
import paper from "@/components/ui/paper.module.css";
import { cut } from "@/components/ui/Notes";
import m from "./Market.module.css";

const MF = manifest as unknown as MarketManifest;
const N = projects.length;
const PAGES = copy.pages.length;
/** Steps per stall: arrive on page 1, then turn to each next page. */
const PER = PAGES;
const LAST = N * PER + 1; // the pier
/** Scroll step k -> camera depth: walk between stalls, hold while the pages turn. */
const zAt = (k: number) => {
  const v = k - 1;
  if (v < 0) return v;
  const i = Math.floor(v / PER);
  return i + Math.max(0, v - i * PER - (PER - 1));
};
/** Stall n (-1 = gate), page j -> its scroll step. */
const stepOf = (n: number, j = 0) => (n < 0 ? 0 : 1 + n * PER + j);
const src = (f: string) => `/art/market/${f}`;

const isReduced = () =>
  document.documentElement.dataset.motion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A box in its piece's own art units. */
const box = ([x, y, w, h]: Rect) => ({ "--bx": x, "--by": y, "--bw": w, "--bh": h }) as CSSProperties;

/**
 * One set piece at depth n. (ax, ay) is where its anchor rests in the frame at d = 0; oy: anchor at the bottom (1) or top (0).
 * (sx, sy): which way it slides out once passed. s0: its rest scale (phones show the stall smaller, never above 1).
 */
type Place = { n: number; ax: number; ay: number; w: number; h: number; oy?: number; sx?: number; sy?: number; s0?: number };
const place = ({ n, ax, ay, w, h, oy = 1, sx = 0, sy = 0, s0 = 1 }: Place) =>
  ({ "--n": n, "--ax": ax, "--ay": ay, "--w": w, "--h": h, "--oy": oy, "--sx": sx, "--sy": sy, "--s0": s0, zIndex: Math.round(100 - n * 10) }) as CSSProperties;

const Facts = ({ stop }: { stop: Stop }) => (
  <dl className={m.facts}>
    {(stop.tag.facts ?? []).slice(0, 3).map(([v, l]) => (
      <div key={l}>
        <dt>{l}</dt>
        <dd>{v}</dd>
      </div>
    ))}
  </dl>
);

/** How it works: the stall's steps (each with its line of what was done), then its spec rows and legend. */
const How = ({ c }: { c: Stop["card"] }) => (
  <>
    {c.steps && (
      <ol className={m.steps}>
        {c.steps.map((t, k) => (
          <li key={t}>
            <b>{t}</b>
            {c.highlights?.[k] && <span>{cut(c.highlights[k])}</span>}
          </li>
        ))}
      </ol>
    )}
    {c.spec && (
      <dl className={m.spec}>
        {c.spec.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    )}
    {c.legend && (
      <p className={m.legend}>
        {c.legend.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </p>
    )}
  </>
);

/** The words for each of the four scenes: what the old booklet's pages said. */
const pageBody = (p: Stop) => {
  const c = p.card;
  return [
    <>
      {c.subtitle && <p className={m.sub}>{c.subtitle}</p>}
      <p className={m.sum}>{c.summary ?? p.tag.hook}</p>
      {c.date && <p className={m.when}>{c.date}</p>}
    </>,
    <How key="how" c={c} />,
    <ul key="built" className={m.bullets}>
      {(c.highlights ?? []).map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>,
    <>
      <ul className={m.chips}>
        {(c.chips ?? []).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {c.awards && (
        <ul className={m.awards}>
          {c.awards.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      <p className={m.close}>{p.tag.hook}</p>
    </>,
  ];
};

/**
 * The lit cloth of stall n's shadow play: four scenes stacked, each a soft backdrop and the puppets on their rods, and
 * the three gunungan that sweep across between them. All driven by the stall's scene progress --pg (Market.module.css).
 */
const Cloth = ({ n }: { n: number }) => (
  <div className={m.cloth} aria-hidden="true">
    <i className={m.flicker} />
    {MF.play.scenes[n]!.map((s, j) => (
      <div key={j} className={m.scene} style={{ "--j": j } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={m.set} src={src(s.set)} alt="" draggable={false} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={m.cast} src={src(s.cast)} alt="" draggable={false} />
      </div>
    ))}
    {[1, 2, 3].map((g) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={g} className={m.gun} src={src(MF.play.gunungan.f)} alt="" draggable={false} style={{ "--g": g } as CSSProperties} />
    ))}
  </div>
);

/** The paper under the screen: the current scene's words, crossfading with the scenes. */
const Captions = ({ p, page }: { p: Stop; page: number }) => {
  const body = pageBody(p);
  return (
    <div className={m.caption}>
      {copy.pages.map((label, j) => (
        <article key={label} className={m.cap} style={{ "--j": j } as CSSProperties} inert={j !== page} aria-label={`${label}, ${j + 1} of ${PAGES}`}>
          <h3 className={m.pageHead}>{label}</h3>
          {body[j]}
        </article>
      ))}
    </div>
  );
};

/** The playbill on the stall's nail: tonight's four scenes, the current one marked; each line plays its scene. */
const Bill = ({ p, on, go }: { p: Stop; on: number; go: (j: number) => void }) => (
  <nav className={m.bill} aria-label={`${p.tag.title}: scenes`}>
    <ol>
      {copy.pages.map((label, j) => (
        <li key={label}>
          <button type="button" aria-current={j === on ? "step" : undefined} onClick={() => go(j)}>
            {label}
          </button>
        </li>
      ))}
    </ol>
  </nav>
);

export type MarketHandle = { step: (dir: number) => void };

type Props = {
  L: Layout;
  /** Stall to show (0..4, on its first page); -1 = the gate. Jumps on mount, scrolls on later changes. */
  target: number;
  /** The stall and scene now in view. */
  onLevel: (n: number, page: number) => void;
  onBack: () => void;
  /** The reeds are open: the string lights come on. */
  open: boolean;
  /** step(±1): one page (or walk) on, for the nav buttons. */
  ref?: Ref<MarketHandle>;
};

export function Market({ L, target, onLevel, onBack, open, ref }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pierRef = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(() => Math.max(0, Math.min(N - 1, target)));
  const [page, setPage] = useState(0);
  const curRef = useRef(cur);
  const stepRef = useRef(stepOf(target));
  const [z0] = useState(target); // first paint only; the scroll loop owns --z and --v after that
  const onLevelRef = useRef(onLevel);
  useEffect(() => {
    onLevelRef.current = onLevel;
  }, [onLevel]);
  const first = useRef(true);
  /** Scroll offset of step k: one opening per step. */
  const stepTop = (k: number) => k * (rootRef.current?.clientHeight ?? 0);
  const goStep = (k: number) =>
    rootRef.current!.scrollTo({ top: stepTop(Math.max(0, Math.min(LAST, k))), behavior: isReduced() ? "auto" : "smooth" });
  useImperativeHandle(ref, () => ({ step: (dir) => goStep(stepRef.current + dir) }));

  // Target: jump on mount, smooth scroll later. Never chase our own onLevel echo (River feeds it back as target).
  useEffect(() => {
    const root = rootRef.current!;
    if (first.current) {
      first.current = false;
      root.scrollTop = stepTop(stepOf(target));
      root.focus({ preventScroll: true });
      return;
    }
    if (target === curRef.current) return;
    root.scrollTo({ top: stepTop(stepOf(target)), behavior: isReduced() ? "auto" : "smooth" });
  }, [target]);

  // Resize: stay on the current step.
  const prevL = useRef(L);
  useEffect(() => {
    if (prevL.current === L) return;
    prevL.current = L;
    rootRef.current!.scrollTop = stepTop(stepRef.current);
  }, [L]);

  // Current step: the one crossing the viewport's centre line. Stall steps report their stall and page.
  useEffect(() => {
    const root = rootRef.current!;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          const k = Number((e.target as HTMLElement).dataset.step);
          stepRef.current = k;
          if (k < 1 || k >= LAST) continue;
          const n = Math.floor((k - 1) / PER);
          const j = k - 1 - n * PER;
          curRef.current = n;
          setCur(n);
          setPage(j);
          onLevelRef.current(n, j);
        }
      },
      { root, rootMargin: "-50% 0px -50% 0px" },
    );
    root.querySelectorAll("[data-step]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // --z: camera depth, one rAF per scroll burst. Prime first: two frames with every piece at its rest scale, so the
  // compositor rasters each at full size behind the closed reeds and never re-rasters it smaller (will-change keeps it).
  useEffect(() => {
    const root = rootRef.current!;
    let raf = 0;
    let last = NaN;
    let end: boolean | null = null;
    const update = () => {
      raf = 0;
      const u = Math.round((root.scrollTop / (root.clientHeight || 1)) * 1000) / 1000;
      if (u === last) return;
      last = u;
      const z = zAt(u);
      root.style.setProperty("--v", String(u - 1));
      root.style.setProperty("--z", String(z));
      const e = z > N - 0.5;
      if (e === end) return;
      end = e;
      root.toggleAttribute("data-end", e);
      pierRef.current!.inert = !e;
    };
    // Settle: once the scroll goes idle, walk on to the next step in the scroll's direction (or the nearest after a long
    // fling). Not CSS mandatory snap: that pulls every small wheel notch straight back, so a notched mouse never gets anywhere.
    let base = Math.round(root.scrollTop / (root.clientHeight || 1));
    let idle = 0;
    let touching = false;
    const settle = () => {
      if (touching) return;
      const u = root.scrollTop / (root.clientHeight || 1);
      const du = u - base;
      const to = Math.max(0, Math.min(LAST, Math.abs(du) < 0.02 ? base : Math.abs(du) < 0.5 ? base + Math.sign(du) : Math.round(u)));
      base = to;
      if (Math.abs(u - to) * root.clientHeight > 1) root.scrollTo({ top: stepTop(to), behavior: isReduced() ? "auto" : "smooth" });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
      clearTimeout(idle);
      idle = window.setTimeout(settle, 140);
    };
    const onTouch = (e: TouchEvent) => {
      touching = e.type === "touchstart";
      if (!touching) onScroll();
    };
    update();
    let prime = requestAnimationFrame(() => (prime = requestAnimationFrame(() => root.removeAttribute("data-prime"))));
    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("touchstart", onTouch, { passive: true });
    root.addEventListener("touchend", onTouch, { passive: true });
    return () => {
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("touchstart", onTouch);
      root.removeEventListener("touchend", onTouch);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(prime);
      clearTimeout(idle);
    };
  }, []);

  const phone = L.compact;
  const vars = {
    "--k": `${L.k}px`,
    "--fx": `${L.ow / 2 - (MF.W / 2) * L.k}px`,
    "--fy": `${L.top}px`,
    "--vx": MF.VP[0],
    "--vy": MF.VP[1],
    "--z": z0,
    "--v": stepOf(z0) - 1,
  } as CSSProperties;
  const full = { ax: MF.W / 2, ay: MF.H, w: MF.W, h: MF.H };
  const g = MF.gate;

  return (
    <div
      ref={rootRef}
      className={m.root}
      style={vars}
      role="region"
      aria-label={copy.made}
      tabIndex={-1}
      data-compact={phone || undefined}
      data-open={open || undefined}
      data-prime=""
    >
      <div className={m.stage}>
        {[MF.sky, MF.floor, MF.far].map((a, j) => (
          // eslint-disable-next-line @next/next/no-img-element -- pre-built SVG art, next/image adds nothing here
          <img key={a.f} className={m.back} src={src(a.f)} alt="" draggable={false} style={{ "--w": a.w, "--h": a.h, zIndex: j } as CSSProperties} />
        ))}

        <div className={`${m.item} ${m.gate}`} style={place({ n: -0.5, ...full })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={m.art} src={src(g.f)} alt="" draggable={false} />
          <div className={m.banner} style={box(g.banner)}>
            <h2 className={m.bannerText}>{copy.made}</h2>
          </div>
          <p className={m.count} style={box(g.banner)}>
            {copy.madeCount}
          </p>
          {g.steam.map(([x, y], j) => (
            <i key={j} className={m.steam} style={{ "--px": x, "--py": y } as CSSProperties} aria-hidden="true" />
          ))}
        </div>

        {Array.from({ length: N + 1 }, (_, j) => (
          <div
            key={`s${j}`}
            className={`${m.item} ${m.string}`}
            data-first={j === 0 || undefined}
            style={{ ...place({ n: j - 0.5, ax: MF.W / 2, ay: 0, w: MF.string.w, h: MF.string.h, oy: 0, sy: -1 }), "--i": j } as CSSProperties}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={m.art} src={src(MF.string.f)} alt="" draggable={false} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={`${m.art} ${m.lit}`} src={src(MF.string.lit)} alt="" draggable={false} />
          </div>
        ))}

        {projects.map((p, i) => {
          const st = MF.stalls[i]!;
          const side = st.side === "L" ? -1 : 1;
          const rest = phone ? { ax: MF.W / 2 + side * 40, ay: 640, s0: 0.58 } : { ax: MF.W / 2 + side * 420, ay: 990 };
          return (
            <section
              key={p.id}
              className={`${m.item} ${m.stall}`}
              style={place({ n: i, w: st.w, h: st.h, sx: side, ...rest })}
              aria-labelledby={phone ? undefined : `stall-${p.id}`}
              aria-hidden={phone || undefined}
              inert={phone || i !== cur}
              data-cur={i === cur || undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={m.art} src={src(st.f)} alt="" draggable={false} />
              <div className={m.glows} aria-hidden="true">
                {st.glows.map(([x, y, r], j) => (
                  <i key={j} style={{ "--px": x, "--py": y, "--pr": r } as CSSProperties} />
                ))}
              </div>
              {st.steam.map(([x, y], j) => (
                <i key={j} className={m.steam} style={{ "--px": x, "--py": y } as CSSProperties} aria-hidden="true" />
              ))}
              <div className={m.banner} style={box(st.slots.banner)}>
                <h2 id={phone ? undefined : `stall-${p.id}`} className={m.bannerText}>
                  {p.tag.title}
                </h2>
              </div>
              {!phone && (
                <>
                  <div className={m.board} style={box(st.slots.board)}>
                    <Facts stop={p} />
                  </div>
                  <div className={m.nota} style={box(st.slots.nota)} data-side={st.side}>
                    <Bill p={p} on={i === cur ? page : 0} go={(j) => goStep(stepOf(i, j))} />
                  </div>
                </>
              )}
            </section>
          );
        })}

        {!phone &&
          projects.map((p, i) => {
            // The kelir stands across the lane from its stall, and slides out the other way.
            const side = MF.stalls[i]!.side === "L" ? -1 : 1;
            const P = MF.play.screen;
            return (
              <div
                key={`k${p.id}`}
                className={`${m.item} ${m.kelir}`}
                style={place({ n: i, ax: MF.W / 2 - side * 430, ay: 990, w: P.w, h: P.h, sx: -side })}
                inert={i !== cur}
                data-cur={i === cur || undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={m.art} src={src(P.f)} alt="" draggable={false} />
                <i className={m.lamp} style={{ "--px": P.lamp[0], "--py": P.lamp[1], "--pr": P.lamp[2] } as CSSProperties} aria-hidden="true" />
                <div className={m.clothBox} style={box(P.cloth)}>
                  <Cloth n={i} />
                </div>
                <div className={m.capBox} style={box(P.caption)}>
                  <Captions p={p} page={i === cur ? page : 0} />
                </div>
              </div>
            );
          })}

        <div ref={pierRef} className={`${m.item} ${m.pier}`} style={place({ n: N, ...full })} inert>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={m.art} src={src(MF.pier.f)} alt="" draggable={false} />
          <div className={m.backMount}>
            <span className={m.sheet} aria-hidden="true" />
            <span className={m.sheet} aria-hidden="true" />
            <button type="button" className={`${paper.btnPaper} ${m.backBtn}`} onClick={onBack}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path d="M10 5l7 7-7 7M17 12H4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
              </svg>
              {copy.backToMain}
            </button>
          </div>
        </div>

        {!phone && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={m.walker} src={src(MF.walker.f)} alt="" draggable={false} style={{ "--w": MF.walker.w, "--h": MF.walker.h } as CSSProperties} />
        )}

        {phone && (
          // Phones: the stall's play and words in a paper strip under it (the stall itself is too small to carry them).
          <section key={cur} className={m.strip} style={{ "--n": cur } as CSSProperties} aria-labelledby={`stall-${projects[cur]!.id}`}>
            <h2 id={`stall-${projects[cur]!.id}`} className={m.stripTitle}>
              {projects[cur]!.tag.title}
            </h2>
            <Cloth n={cur} />
            <Captions p={projects[cur]!} page={page} />
            <Facts stop={projects[cur]!} />
          </section>
        )}
      </div>

      {/* The walk: one opening per step (gate, each stall's pages, pier). */}
      <div className={m.spacer} aria-hidden="true">
        {Array.from({ length: LAST + 1 }, (_, k) => (
          <div key={k} className={m.step} data-step={k} />
        ))}
      </div>
    </div>
  );
}

export default Market;
