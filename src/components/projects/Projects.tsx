"use client";
import { useEffect, useRef, useState } from "react";
import { ImageSlot } from "@/components/ui/ImageSlot";
import paper from "@/components/ui/paper.module.css";
import { copy, projects, stops } from "@/content/site";
import { hashFor } from "@/lib/nav";
import s from "./Projects.module.css";

/*
 * Under the river: the projects section. The water rises over the river and you sink through it, past moonlit
 * shallows, the lantern deep and a sunken candi (art/deep.ts; pure scene, no project props). The only per-frame JS
 * is scroll progress written as --p; the paper layers slide on it in CSS, so taller layers travel further. One paper
 * card per project floats up as you sink (scroll-driven CSS); the card in view sets the counter and #made-N.
 * Each card shows its project's image once site.ts gives it a cover. `at` is the card to land on (from a sign, the tab or #made-N). The lantern drifts to the side the card isn't on.
 */
const LAYERS = [["back", 3200], ["mid", 4600], ["near", 6000]] as const;
const pad = (n: number) => String(n).padStart(2, "0");
const reduced = () => document.documentElement.dataset.motion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Projects({ at, onClose }: { at: number; onClose(): void }) {
  const root = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const intro = useRef<HTMLElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const landed = useRef(false);
  const [here, setHere] = useState(at || -1); // -1: at the surface, above the cards

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, []);

  // The dive: scroll progress 0..1 as --p, once a frame. Reduced motion leaves the scene at rest.
  useEffect(() => {
    const sc = scroller.current, el = root.current;
    if (!sc || !el || reduced()) return;
    let raf = 0;
    const write = () => {
      raf = 0;
      const max = sc.scrollHeight - sc.clientHeight;
      el.style.setProperty("--p", max > 0 ? (sc.scrollTop / max).toFixed(4) : "0");
    };
    const onScroll = () => void (raf ||= requestAnimationFrame(write));
    write();
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      sc.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // The card crossing the middle of the view is the one you're at (the intro counts as -1).
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          const n = cards.current.indexOf(e.target as HTMLElement);
          setHere(n);
          if (n >= 0) history.replaceState(null, "", hashFor("channel", n));
        }
      },
      { root: scroller.current, rootMargin: "-45% 0px -45% 0px" },
    );
    for (const c of [intro.current, ...cards.current]) if (c) io.observe(c);
    return () => io.disconnect();
  }, []);

  // Land on card `at`: instantly on open, smoothly after. ponytail: card 1 lands at the surface, where the dive starts.
  useEffect(() => {
    const sc = scroller.current, el = cards.current[at];
    if (!sc || !el) return;
    const top = at === 0 ? 0 : el.offsetTop + el.offsetHeight / 2 - sc.clientHeight / 2;
    sc.scrollTo({ top, behavior: landed.current && !reduced() ? "smooth" : "instant" });
    landed.current = true;
  }, [at]);

  return (
    <section className={s.deep} ref={root} role="dialog" aria-labelledby="made-title" data-side={here < 0 ? undefined : here % 2 ? "r" : "l"}>
      <div className={s.stage} aria-hidden="true">
        {LAYERS.map(([n, h]) => (
          // eslint-disable-next-line @next/next/no-img-element -- pre-built SVG art, next/image adds nothing here
          <img key={n} className={s.layer} src={`/art/deep/${n}.svg`} width={1600} height={h} alt="" decoding="async" draggable={false} />
        ))}
        <i className={s.glow} />
        <span className={s.lamp}>
          <i className={s.shade} />
        </span>
      </div>

      <div className={s.bar}>
        <p className={s.count} aria-hidden="true">
          {pad(Math.max(here, 0) + 1)} <span>/ {pad(projects.length)}</span>
        </p>
        <button type="button" className={s.close} onClick={onClose}>
          <span aria-hidden="true">↑</span> {copy.backToMain}
        </button>
      </div>

      <div className={s.scroll} ref={scroller}>
        <header className={s.intro} ref={intro}>
          <p className={s.kicker}>{copy.madeKicker}</p>
          <h2 id="made-title" className={s.heading} ref={title} tabIndex={-1}>
            {copy.made}
          </h2>
          <p className={s.lede}>{stops[1]!.card.summary}</p>
          <p className={s.sink} aria-hidden="true">
            {copy.sink} <span>↓</span>
          </p>
        </header>

        {projects.map((p, i) => {
          const { card, tag } = p;
          const steps = card.steps ?? [];
          return (
            <article
              key={p.id}
              ref={(el) => {
                cards.current[i] = el;
              }}
              className={`${s.slot} ${paper.skin}`}
              data-stop="stop-1"
              data-side={i % 2 ? "r" : "l"}
              aria-labelledby={`${p.id}-title`}
            >
              <div className={s.card} data-v={i % 3}>
                <span className={paper.sheet} />
                {card.image?.cover && <ImageSlot image={card.image} />}
                <p className={s.meta}>
                  <span>{pad(i + 1)}</span>
                  {tag.date}
                </p>
                <h3 id={`${p.id}-title`} className={s.title}>
                  {card.title}
                </h3>
                {card.subtitle && <p className={s.sub}>{card.subtitle}</p>}
                {card.summary && <p className={s.summary}>{card.summary}</p>}
                {tag.facts && (
                  <dl className={s.facts}>
                    {tag.facts.map(([v, l]) => (
                      <div key={l}>
                        <dt>{l}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {card.chips && (
                  <ul className={s.chips} aria-label="Stack">
                    {card.chips.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
                <details className={s.more}>
                  <summary>{copy.howItWorks}</summary>
                  <ol className={s.built}>
                    {(card.highlights ?? []).map((h, n) => (
                      <li key={h}>
                        {steps[n] && <b>{steps[n]}. </b>}
                        {h}
                      </li>
                    ))}
                  </ol>
                  {card.spec && (
                    <dl className={s.spec}>
                      {card.spec.map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {card.awards?.map((a) => (
                    <p key={a} className={s.award}>
                      {a}
                    </p>
                  ))}
                </details>
                <i className={s.bubbles} aria-hidden="true" />
              </div>
            </article>
          );
        })}

        <footer className={s.outro}>
          <button type="button" className={paper.btnPaper} onClick={onClose}>
            <span aria-hidden="true">↑</span> {copy.backToMain}
          </button>
        </footer>
      </div>
    </section>
  );
}

export default Projects;
