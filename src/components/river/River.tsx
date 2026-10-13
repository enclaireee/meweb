"use client";
// The river: navigation state, the one rAF loop (glide + pointer smoothing), input, tags, card and chrome.
// Per frame it only writes CSS variables; React renders on phase changes.
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import { dials, stops, type CardAt } from "@/content/site";
import { camAt, camCss } from "@/lib/camera";
import { layerFx } from "@/lib/fx";
import { createWheelGate, keyIntent, swipeStep } from "@/lib/input";
import { computeLayout, HANG, P, PAD, type Layout } from "@/lib/layout";
import * as nav from "@/lib/nav";
import { skyAt, skyBackground } from "@/lib/sky";
import { Frame } from "@/components/frame/Frame";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/ui/Footer";
import { Hint } from "@/components/ui/Hint";
import { NavButtons } from "@/components/ui/NavButtons";
import { StopDots } from "@/components/ui/StopDots";
import { Tag } from "@/components/ui/Tag";
import { World } from "./World";
import s from "./river.module.css";

const CAMS = dials.map((d) => d.cam);

type Action = { t: "step"; dir: -1 | 1 } | { t: "jump"; n: number } | { t: "arrived" } | { t: "open" } | { t: "close" } | { t: "set"; n: number };

function reducer(st: nav.Nav, a: Action): nav.Nav {
  switch (a.t) {
    case "step":
      return nav.step(st, a.dir);
    case "jump":
      return nav.jump(st, a.n);
    case "arrived":
      return nav.arrived(st);
    case "open":
      return nav.openCard(st);
    case "close":
      return nav.closeCard(st);
    case "set":
      return nav.initial(a.n);
  }
}

/** Which way the world leans while a card is open: away from the card. Phones keep it still (the sheet covers the width). */
const cardSide = (at: CardAt, compact?: boolean) => (compact ? undefined : at.y === "bottom" && at.x === "center" ? "bottom" : at.x === "left" ? "left" : "right");

const isReduced = () =>
  document.documentElement.dataset.motion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches;

type TagState = "hidden" | "swing" | "rest";

export function River() {
  const [st, dispatch] = useReducer(reducer, undefined, () => nav.initial(0));
  const [L, setL] = useState<Layout | null>(null);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [tagState, setTagState] = useState<TagState>("hidden");
  const [traveller, setTraveller] = useState("idle");
  const [looking, setLooking] = useState(false);
  const [visited, setVisited] = useState<number[]>([]);
  const [fade, setFade] = useState(false);
  const [tagShift, setTagShift] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const tagWrapRef = useRef<HTMLDivElement>(null);
  const fxEls = useRef(new Map<string, { el: HTMLDivElement; fx: string }>());
  const wheel = useRef(createWheelGate());
  const mountedAt = useRef(0);
  const startle = useRef(0);
  const a = useRef({
    pos: 0,
    raf: 0,
    move: null as null | { from: number; to: number; start: number; dur: number },
    ptr: { x: 0, y: 0, tx: 0, ty: 0, last: 0, active: false },
    reduced: false,
    compact: false,
  });

  /** The diorama camera: per-stop shot, mid-glide swing, pointer tilt. */
  const applyCam = useCallback(() => {
    const A = a.current;
    const c = camAt(A.pos, CAMS, { compact: A.compact, reduced: A.reduced, px: A.ptr.x, py: A.ptr.y });
    stageRef.current?.style.setProperty("--cam", camCss(c));
  }, []);

  /** Write everything that depends on the fractional stop. */
  const applyPos = useCallback((p: number) => {
    a.current.pos = p;
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--pos", p.toFixed(4));
    for (const { el, fx } of fxEls.current.values()) {
      const f = layerFx(fx, p);
      el.style.opacity = f.opacity.toFixed(3);
      el.style.setProperty("--ty", f.ty.toFixed(1));
    }
    if (skyRef.current) skyRef.current.style.background = skyBackground(skyAt(p, document.documentElement.dataset.time === "day"));
    applyCam();
  }, [applyCam]);

  const fxRef = useCallback(
    (id: string, fx: string) => (el: HTMLDivElement | null) => {
      if (el) {
        fxEls.current.set(id, { el, fx });
        const f = layerFx(fx, a.current.pos);
        el.style.opacity = f.opacity.toFixed(3);
        el.style.setProperty("--ty", f.ty.toFixed(1));
      } else fxEls.current.delete(id);
    },
    [],
  );

  // The single rAF loop: runs only while a glide or a pointer follow is in progress.
  const frame = useRef<(now: number) => void>(() => {});
  const kick = useCallback(() => {
    if (!a.current.raf) a.current.raf = requestAnimationFrame((t) => frame.current(t));
  }, []);
  useEffect(() => {
    frame.current = (now) => {
      const A = a.current;
      A.raf = 0;
      let again = false;
      if (A.move) {
        const { from, to, start, dur } = A.move;
        const t = Math.min(1, (now - start) / dur);
        applyPos(from + (to - from) * nav.easeGlide(t));
        if (t < 1) again = true;
        else {
          A.move = null;
          dispatch({ t: "arrived" });
        }
      }
      const p = A.ptr;
      if (p.active) {
        const k = 1 - Math.exp(-(now - (p.last || now - 16)) / 180);
        p.last = now;
        p.x += (p.tx - p.x) * k;
        p.y += (p.ty - p.y) * k;
        stageRef.current?.style.setProperty("--px", p.x.toFixed(4));
        stageRef.current?.style.setProperty("--py", p.y.toFixed(4));
        applyCam();
        if (Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) < 0.001) {
          p.active = false;
          p.last = 0;
        } else again = true;
      }
      if (again) kick();
    };
  }, [applyPos, applyCam, kick]);

  // Mount: deep link, reduced motion, layout.
  useEffect(() => {
    mountedAt.current = performance.now();
    const n = nav.stopFromHash(location.hash) ?? 0;
    dispatch({ t: "set", n });
    applyPos(n);
    a.current.reduced = isReduced();
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      a.current.reduced = isReduced();
      applyCam();
    };
    mq.addEventListener("change", onMotion);
    const onTime = () => applyPos(a.current.pos);
    window.addEventListener("timechange", onTime);
    const stage = stageRef.current!;
    const ro = new ResizeObserver(() => {
      const r = stage.getBoundingClientRect();
      const lay = computeLayout(innerWidth, innerHeight, { w: r.width, h: r.height });
      stage.style.setProperty("--k", `${lay.k}px`);
      stage.style.setProperty("--anchor", `${lay.anchor}px`);
      stage.style.setProperty("--top", `${lay.top}px`);
      // Camera pivot: horizontally centred, on the action plane's horizon band.
      stage.style.setProperty("--ox", `${r.width / 2}px`);
      stage.style.setProperty("--oy", `${lay.top + 450 * lay.k}px`);
      a.current.compact = lay.compact;
      applyCam();
      setL(lay);
    });
    ro.observe(stage);
    const onVis = () => document.documentElement.toggleAttribute("data-paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const onHash = () => {
      const h = nav.stopFromHash(location.hash);
      if (h !== null) dispatch({ t: "jump", n: h });
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      mq.removeEventListener("change", onMotion);
      window.removeEventListener("timechange", onTime);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("hashchange", onHash);
    };
  }, [applyPos, applyCam]);

  // Start a move whenever the machine enters `moving` (or retargets mid-move).
  useEffect(() => {
    if (st.phase !== "moving") return;
    const A = a.current;
    const from = A.pos;
    const to = st.to;
    setRange([Math.min(from, to), Math.max(from, to)]); // only matters for a retarget mid-move (pos off the stop..to span)
    setTagState("hidden");
    wheel.current.moveStarted();
    if (A.reduced) {
      // 250 ms cross-fade, position swapped at the midpoint.
      setFade(true);
      const t1 = setTimeout(() => {
        applyPos(to);
        setFade(false);
      }, 125);
      const t2 = setTimeout(() => dispatch({ t: "arrived" }), 250);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    // Hold the glide until the tiles it will reveal are decoded (capped), so nothing pops in mid-move.
    let live = true;
    let arriving = 0;
    const go = () => {
      if (!live) return;
      const dur = nav.moveDuration(to - Math.round(A.pos));
      A.move = { from: A.pos, to, start: performance.now(), dur };
      setTraveller("travelling");
      arriving = window.setTimeout(() => setTraveller("arriving"), dur - 300);
      kick();
    };
    const imgs = A.move ? [] : [...stageRef.current!.querySelectorAll("img")]; // retarget mid-glide: no pause
    void Promise.race([Promise.all(imgs.map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 300))]).then(go);
    return () => {
      live = false;
      clearTimeout(arriving);
    };
  }, [st.phase, st.to, applyPos, kick]);

  // Arrival: settle the tag, announce, update the hash.
  useEffect(() => {
    if (st.phase !== "rest") return;
    wheel.current.moveEnded(performance.now());
    history.replaceState(null, "", st.stop ? `#stop-${st.stop}` : location.pathname + location.search);
    // The first tag waits for the world to fade up (entry sequence), later ones swing in on arrival.
    // Reduced motion: straight to rest (a 0 ms timeout keeps setState out of the effect body).
    const reduced = a.current.reduced;
    const delay = reduced ? 0 : Math.max(0, 1600 - (performance.now() - mountedAt.current));
    const t1 = setTimeout(() => setTagState((t) => (reduced ? "rest" : t === "hidden" ? "swing" : t)), delay);
    const t2 = reduced ? 0 : setTimeout(() => setTagState("rest"), delay + 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [st.phase, st.stop]);

  // Inputs: keyboard on window, wheel and touch on the stage.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof Element ? e.target : document.body;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t.closest("input, textarea, select, [contenteditable], dialog")) return;
      const intent = keyIntent(e, !!t.closest("button, a"));
      if (!intent) return;
      e.preventDefault();
      dispatch("step" in intent ? { t: "step", dir: intent.step } : { t: "jump", n: intent.jump });
    };
    const stage = stageRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = e.deltaMode === 1 ? (e.deltaX + e.deltaY) * 16 : e.deltaX + e.deltaY;
      const dir = wheel.current.feed(d, e.timeStamp);
      if (dir) dispatch({ t: "step", dir });
    };
    let touch: { x: number; y: number; t: number } | null = null;
    const onStart = (e: TouchEvent) => {
      const p = e.touches[0]!;
      touch = { x: p.clientX, y: p.clientY, t: e.timeStamp };
    };
    const onEnd = (e: TouchEvent) => {
      const p = e.changedTouches[0];
      if (!touch || !p) return;
      const dir = swipeStep(p.clientX - touch.x, p.clientY - touch.y, e.timeStamp - touch.t);
      touch = null;
      if (dir) dispatch({ t: "step", dir });
    };
    // Pointer parallax: fine pointers only, never under reduced motion.
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      if (a.current.reduced || e.pointerType !== "mouse") return;
      const r = stage.getBoundingClientRect();
      const p = a.current.ptr;
      p.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      p.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      p.active = true;
      kick();
    };
    window.addEventListener("keydown", onKey);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("touchstart", onStart, { passive: true });
    stage.addEventListener("touchend", onEnd, { passive: true });
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("touchstart", onStart);
      stage.removeEventListener("touchend", onEnd);
      window.removeEventListener("pointermove", onMove);
    };
  }, [kick]);

  // Phones: slide the tag paper inside the opening; the string stays on the hook.
  useLayoutEffect(() => {
    const btn = tagWrapRef.current?.querySelector("button");
    if (!L || !btn) return;
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage) return;
    // Measure on screen: each stop's camera (dolly, yaw) rescales the tag plane, so layout units alone overshoot.
    // The swing is paused for the read so the box is unrotated; restarting it here only happens on a state change.
    const hang = btn.parentElement!;
    hang.style.animation = "none";
    const r = btn.getBoundingClientRect();
    hang.style.animation = "";
    const k = r.width / btn.offsetWidth || 1;
    const edge = 16;
    // Undo the shift already applied (s, on screen s·k) and solve from the unshifted box, so it can also relax to 0.
    setTagShift((s) => {
      const left = r.left - s * k;
      const right = r.right - s * k;
      return (Math.min(0, stage.right - edge - right) + Math.max(0, stage.left + edge - left)) / k;
    });
  }, [L, st.stop, tagState]);

  const ffStops = useMemo(() => (st.phase === "moving" ? [st.stop, st.to] : [st.stop]), [st.phase, st.stop, st.to]);
  const travellerState = st.phase === "card" ? "greeting" : st.phase === "moving" ? traveller : looking ? "looking" : "idle";
  const moving = st.phase === "moving";
  const resting = L !== null && !moving; // L is set after the mount effect has applied the deep link
  // Tiles: the stop (or the move span) plus one stop either side, so the next step's art is already decoded.
  const last = stops.length - 1;
  const lo = Math.max(0, Math.min(st.stop, moving ? st.to : st.stop, moving ? range[0] : Infinity) - 1);
  const hi = Math.min(last, Math.max(st.stop, moving ? st.to : st.stop, moving ? range[1] : -Infinity) + 1);
  const live = resting ? `Stop ${st.stop + 1} of ${stops.length}, ${stops[st.stop]!.place}: ${stops[st.stop]!.tag.title}` : "";
  // Adjusting state during render (React's sanctioned pattern): remember stops once settled on them.
  if (resting && !visited.includes(st.stop)) setVisited([...visited, st.stop]);
  const tagStops = st.phase === "moving" && st.to !== st.stop ? [st.stop, st.to] : [st.stop];

  // Tap the scene: a ripple ring where you touched, and the fireflies startle. Not on buttons, not under reduced motion.
  const ripple = (e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || a.current.reduced || (e.target as Element).closest("button, a")) return;
    const r = stage.getBoundingClientRect();
    const el = document.createElement("i");
    el.className = s.ripple!;
    el.style.left = `${e.clientX - r.left}px`;
    el.style.top = `${e.clientY - r.top}px`;
    el.addEventListener("animationend", () => el.remove());
    stage.append(el);
    stage.setAttribute("data-startle", "");
    clearTimeout(startle.current);
    startle.current = window.setTimeout(() => stage.removeAttribute("data-startle"), 350);
  };

  const closeCard = () => {
    dispatch({ t: "close" });
    requestAnimationFrame(() => tagWrapRef.current?.querySelector("button")?.focus());
  };

  return (
    <div className={s.root}>
      <Frame>
        <div
          className={s.stage}
          ref={stageRef}
          data-moving={st.phase === "moving"}
          data-fade={fade}
          data-card={st.phase === "card" ? cardSide(stops[st.stop]!.card.at, L?.compact) : undefined}
          onClick={ripple}
        >
          {L && (
            <>
              <World L={L} lo={lo} hi={hi} ffStops={ffStops} ffActive={st.to} travellerState={travellerState} fxRef={fxRef} skyRef={skyRef} lifeStop={st.stop} lifeOn={!moving} />
              <div className={s.tags} id="river" tabIndex={-1}>
                <div className={s.layer} style={{ "--s": 1 } as CSSProperties}>
                  {tagStops.map((i) => (
                    <div
                      key={i}
                      ref={i === st.stop ? tagWrapRef : undefined}
                      className={s.tagAt}
                      style={{ "--x": PAD + i * P + HANG, "--tag-shift": `${tagShift}px` } as CSSProperties}
                      onPointerEnter={() => setLooking(true)}
                      onPointerLeave={() => setLooking(false)}
                      inert={st.phase === "moving" || undefined}
                    >
                      <Tag
                        stop={stops[i]!}
                        state={st.phase === "moving" ? "hidden" : tagState}
                        compact={L.compact}
                        onOpen={() => dispatch({ t: "open" })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Frame>
      <NavButtons
        onPrev={() => dispatch({ t: "step", dir: -1 })}
        onNext={() => dispatch({ t: "step", dir: 1 })}
        atStart={st.to === 0}
        atEnd={st.to === nav.LAST}
      />
      <StopDots current={st.to} visited={visited} onJump={(n) => dispatch({ t: "jump", n })} />
      <Footer />
      <Hint stepped={visited.length > 1} />
      <Card stop={stops[st.stop]!} open={st.phase === "card"} onClose={closeCard} />
      <p className={s.live} aria-live="polite">
        {live}
      </p>
    </div>
  );
}
