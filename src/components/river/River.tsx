"use client";
// The river: navigation state, the one rAF loop (glide + pointer smoothing), input, paper notes and chrome.
// Two routes: the main river (3 stops, horizontal glide) and the projects night market (Market.tsx, native vertical scroll).
// Per frame it only writes CSS variables; React renders on phase changes.
import { useCallback, useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import { copy, dials, projects, stops } from "@/content/site";
import { camAt, camCss } from "@/lib/camera";
import { layerFx } from "@/lib/fx";
import { createWheelGate, keyIntent, swipeStep } from "@/lib/input";
import { computeLayout, P, PAD, type Layout } from "@/lib/layout";
import * as nav from "@/lib/nav";
import type { Route } from "@/lib/route";
import { skyAt, skyBackground } from "@/lib/sky";
import { Frame } from "@/components/frame/Frame";
import { Footer } from "@/components/ui/Footer";
import { Landing } from "@/components/ui/Landing";
import { Notes } from "@/components/ui/Notes";
import { NavButtons } from "@/components/ui/NavButtons";
import { StopDots } from "@/components/ui/StopDots";
import market from "../../../public/art/market/manifest.json";
import manifest from "../../../public/art/desktop/manifest.json";
import { Market, type MarketHandle } from "@/components/market/Market";
import { Loader } from "./Loader";
import { Reeds, type ReedState } from "./Reeds";
import { INTRO_MS, World } from "./World";
import s from "./river.module.css";

const CAMS = dials.map((d) => d.cam);
/** Reed sweep (Reeds.module.css) and the bow turn at the gate before the boat drops into the cascade. */
const REED_MS = 540;
const TURN_MS = 420;
const tilesOf = (m: { layers: { tiles: { f: string }[] }[] }, dir: string) =>
  m.layers.flatMap((l) => l.tiles.map((t) => `/art/${dir}/${t.f}`));
const MAIN_TILES = tilesOf(manifest, "desktop");
const { sky, far, floor, gate, string: lights, pier, walker, stalls } = market;
const CHANNEL_TILES = [sky, far, floor, gate, lights, { f: lights.lit }, pier, walker, ...stalls].map((a) => `/art/market/${a.f}`);

/** Load and decode tiles before their world mounts, so no layer's content changes after it is on screen. Reports the decoded ratio. */
const preload = (tiles: string[], onProgress: (r: number) => void = () => {}) => {
  let done = 0;
  return Promise.race([
    Promise.all(
      tiles.map((src) => {
        const img = new Image();
        img.src = src;
        return img
          .decode()
          .catch(() => {})
          .then(() => onProgress(++done / tiles.length));
      }),
    ),
    new Promise((r) => setTimeout(r, 8000)), // ponytail: slow network cap; late tiles may still pop in
  ]);
};
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Two painted frames: the swapped-in view is on screen before the reeds part. */
const painted = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

type Action = { t: "step"; dir: -1 | 1 } | { t: "jump"; n: number } | { t: "arrived" } | { t: "set"; n: number };

function reducer(st: nav.Nav, a: Action): nav.Nav {
  switch (a.t) {
    case "step":
      return nav.step(st, a.dir);
    case "jump":
      return nav.jump(st, a.n);
    case "arrived":
      return nav.arrived(st);
    case "set":
      return nav.initial(a.n);
  }
}

const isReduced = () =>
  document.documentElement.dataset.motion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches;

export function River() {
  const [st, dispatch] = useReducer(reducer, undefined, () => nav.initial(0));
  const [L, setL] = useState<Layout | null>(null);
  const [artReady, setArtReady] = useState(false);
  const [shown, setShown] = useState(false); // the settled stop's notes are laid out
  const [traveller, setTraveller] = useState("idle");
  const [looking, setLooking] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const [fade, setFade] = useState(false);
  const [reeds, setReeds] = useState<ReedState>("open");
  const [route, setRoute] = useState<Route>("main");
  const [level, setLevel] = useState(0); // market stall in view
  const [page, setPage] = useState(0); // its booklet page
  const market = useRef<MarketHandle>(null);
  const [target, setTarget] = useState(0); // cascade pool asked for (dots, buttons, hash)
  const [turning, setTurning] = useState(false); // bow turn + dive at the gate
  const [progress, setProgress] = useState(0);
  const [intro, setIntro] = useState<"wait" | "play" | "done">("wait");
  const [loaderGone, setLoaderGone] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const fxEls = useRef(new Map<string, { el: HTMLDivElement; fx: string }>());
  const wheel = useRef(createWheelGate());
  const startle = useRef(0);
  const routeRef = useRef<Route>("main");
  const busy = useRef(false); // a route swap is running
  const pushed = useRef(false); // the cascade has its own history entry, so leaving it is history.back()
  const landing = useRef<number | null>(null); // the stop the mount lands on, until it has
  const channelLoad = useRef<Promise<unknown> | null>(null);
  const stRef = useRef(st);
  useEffect(() => {
    stRef.current = st;
  });
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
    if (skyRef.current) skyRef.current.style.background = skyBackground(skyAt(p));
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

  // Route swaps. In: the bow turns at the gate, the reeds close, the cascade mounts behind them, they part.
  // Out: the reeds close, the cascade unmounts, the main river shows `n`. Reduced motion: an instant swap.
  const enter = useCallback(async (n: number, push: boolean) => {
    if (routeRef.current !== "main" || busy.current || stRef.current.phase === "moving") return;
    busy.current = true;
    routeRef.current = "channel";
    pushed.current = true;
    if (push) history.pushState(null, "", nav.hashFor("channel", n));
    if (!a.current.reduced) {
      setTurning(true);
      setReeds("narrow");
      await wait(TURN_MS);
      setReeds("closed");
      await wait(REED_MS);
    }
    await (channelLoad.current ??= preload(CHANNEL_TILES));
    setTarget(n);
    setLevel(n);
    setRoute("channel");
    setTurning(false);
    await painted();
    await wait(120); // ponytail: raster headroom for the freshly mounted pools before the reeds part
    setReeds("open");
    busy.current = false;
  }, []);

  const exit = useCallback(
    async (n: number) => {
      if (routeRef.current !== "channel" || busy.current) return;
      busy.current = true;
      routeRef.current = "main";
      pushed.current = false;
      if (!a.current.reduced) {
        setReeds("closed");
        await wait(REED_MS);
      }
      if (n !== stRef.current.stop) {
        dispatch({ t: "set", n });
        applyPos(n);
      }
      setRoute("main");
      history.replaceState(null, "", n ? nav.hashFor("main", n) : location.pathname + location.search);
      await painted();
      document.getElementById("river")?.focus({ preventScroll: true });
      setReeds("open");
      busy.current = false;
    },
    [applyPos],
  );

  /** Back to the main river where you left it: through history when the cascade pushed an entry, so the browser's back button agrees. */
  const leave = useCallback(() => {
    if (pushed.current) history.back();
    else void exit(stRef.current.stop);
  }, [exit]);

  // Handlers registered once (hashchange, keydown) reach the latest callbacks through refs.
  const enterRef = useRef(enter);
  const exitRef = useRef(exit);
  const leaveRef = useRef(leave);
  useEffect(() => {
    enterRef.current = enter;
    exitRef.current = exit;
    leaveRef.current = leave;
  });

  const onLevel = useCallback((n: number, pg: number) => {
    if (routeRef.current !== "channel") return;
    setLevel(n);
    setPage(pg);
    setTarget(n);
    setVisited((v) => (v.includes(projects[n]!.id) ? v : [...v, projects[n]!.id]));
    history.replaceState(null, "", nav.hashFor("channel", n));
  }, []);

  // Mount: deep link, reduced motion, layout.
  useEffect(() => {
    let alive = true;
    const place = nav.placeFromHash(location.hash);
    const deep = place?.route === "channel";
    // The loader waits on the main strip only (plus the cascade on a #made-N deep link); the cascade decodes after the intro.
    const ready = preload(deep ? [...MAIN_TILES, ...CHANNEL_TILES] : MAIN_TILES, (r) => alive && setProgress(r));
    if (deep) {
      channelLoad.current = ready;
      routeRef.current = "channel"; // now, so the arrival effect below leaves the #made-N hash alone
    }
    void ready.then(() => {
      if (!alive) return;
      if (deep) {
        setRoute("channel");
        setTarget(place.n);
        setLevel(place.n);
      }
      setArtReady(true);
      setTimeout(() => (channelLoad.current ??= preload(CHANNEL_TILES)), INTRO_MS + 1000);
    });
    const n = place?.route === "main" ? place.n : 0;
    landing.current = n;
    dispatch({ t: "set", n });
    applyPos(n);
    a.current.reduced = isReduced();
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      a.current.reduced = isReduced();
      applyCam();
    };
    mq.addEventListener("change", onMotion);
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
      // Notes are px-sized paper: they grow and shrink a little with the scene, never below readable.
      stage.style.setProperty("--nz", Math.min(1.15, Math.max(0.85, lay.k / 0.85)).toFixed(3));
      a.current.compact = lay.compact;
      applyCam();
      setL(lay);
    });
    ro.observe(stage);
    const onVis = () => document.documentElement.toggleAttribute("data-paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    const onHash = () => {
      const p = nav.placeFromHash(location.hash) ?? { route: "main", n: 0 };
      if (p.route === "channel") {
        if (routeRef.current === "channel") setTarget(p.n);
        else void enterRef.current(p.n, false);
      } else if (routeRef.current === "channel") void exitRef.current(p.n);
      else dispatch({ t: "jump", n: p.n });
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      alive = false;
      mq.removeEventListener("change", onMotion);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("hashchange", onHash);
    };
  }, [applyPos, applyCam]);

  // Start a move whenever the machine enters `moving` (or retargets mid-move).
  useEffect(() => {
    if (st.phase !== "moving") return;
    const A = a.current;
    const to = st.to;
    wheel.current.moveStarted();
    // A 0 ms timeout keeps setState out of the effect body.
    const t0 = setTimeout(() => {
      setShown(false);
      if (A.reduced) setFade(true);
      else setTraveller("travelling");
    }, 0);
    if (A.reduced) {
      // 250 ms cross-fade, position swapped at the midpoint.
      const t1 = setTimeout(() => {
        applyPos(to);
        setFade(false);
      }, 125);
      const t2 = setTimeout(() => dispatch({ t: "arrived" }), 250);
      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    const from = Math.round(A.pos);
    // All art is decoded before the world mounts (preload), so the glide starts at once.
    const dur = nav.moveDuration(to - from);
    A.move = { from: A.pos, to, start: performance.now(), dur };
    const arriving = setTimeout(() => setTraveller("arriving"), dur - 300);
    kick();
    return () => {
      clearTimeout(t0);
      clearTimeout(arriving);
    };
  }, [st.phase, st.to, applyPos, kick]);

  // Arrival: lay the notes out, announce, update the hash.
  useEffect(() => {
    if (st.phase !== "rest") return;
    wheel.current.moveEnded(performance.now());
    // Until the deep-linked stop has landed, the initial stop 0 must not wipe its #stop-N (a Strict Mode remount re-reads it).
    const early = landing.current !== null && landing.current !== st.stop;
    if (!early) landing.current = null;
    if (routeRef.current === "main" && !early) history.replaceState(null, "", st.stop ? nav.hashFor("main", st.stop) : location.pathname + location.search);
    // A 0 ms timeout keeps setState out of the effect body. The first stop's notes also wait for the intro (notesOn).
    const t1 = setTimeout(() => setShown(true), 0);
    return () => clearTimeout(t1);
  }, [st.phase, st.stop]);

  // Inputs: keyboard on window, wheel and touch on the stage.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof Element ? e.target : document.body;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || busy.current) return;
      if (routeRef.current === "channel") {
        if (e.key === "Escape") leaveRef.current();
        return; // the cascade scrolls natively (it holds focus)
      }
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

  const inCascade = route === "channel";
  const travellerState = turning ? "turning" : st.phase === "moving" ? traveller : looking ? "looking" : "idle";
  const moving = st.phase === "moving";
  const resting = L !== null && artReady && !moving; // L is set after the mount effect has applied the deep link
  const here = inCascade ? projects[level]! : stops[st.stop]!;
  const live = !resting
    ? ""
    : inCascade
      ? `${copy.made}, stall ${level + 1} of ${nav.LEVELS}, ${here.tag.title}: ${copy.pages[page]}`
      : `Stop ${st.stop + 1} of ${stops.length}, ${here.place}: ${here.tag.title}`;
  // Adjusting state during render (React's sanctioned pattern): remember stops once settled on them.
  if (resting && !inCascade && !visited.includes(here.id)) setVisited([...visited, here.id]);
  const notesOn = (i: number) => resting && shown && intro === "done" && !turning && i === st.stop;
  const dive = (n = 0) => void enter(n, true);
  const go = (n: number) => dispatch({ t: "jump", n });
  const pool = (n: number) => setTarget(Math.max(0, Math.min(nav.LEVELS - 1, n)));

  // Tap the scene: a ripple ring where you touched, and the fireflies startle. Not on buttons, not under reduced motion.
  const ripple = (e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || a.current.reduced || (e.target as Element).closest("button, a, [data-note]")) return;
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

  return (
    <div className={s.root}>
      <Frame>
        <div
          className={s.stage}
          ref={stageRef}
          data-moving={st.phase === "moving"}
          data-fade={fade}
          data-away={inCascade || undefined}
          inert={inCascade}
          onClick={ripple}
        >
          {L && artReady && (
            <>
              <World L={L} ffActive={st.to} travellerState={travellerState} fxRef={fxRef} skyRef={skyRef} lifeStop={st.stop} lifeOn={!moving} intro={intro} />
              <div className={s.tags} id="river" tabIndex={-1}>
                {L.compact ? (
                  st.stop === 0 ? (
                    <Landing on={notesOn(0)} go={go} flow />
                  ) : (
                    <Notes key={st.stop} stop={stops[st.stop]!} on={notesOn(st.stop)} made={dive} flow />
                  )
                ) : (
                  // Every stop's notes stay mounted: this layer's content never changes during a glide.
                  <div
                    className={s.layer}
                    style={{ "--s": 1 } as CSSProperties}
                    onPointerOver={(e) => setLooking(!!(e.target as Element).closest("[data-note]"))}
                    onPointerLeave={() => setLooking(false)}
                  >
                    {stops.map((stop) => (
                      <div key={stop.id} style={{ "--x": PAD + stop.i * P } as CSSProperties}>
                        {stop.i === 0 ? <Landing on={notesOn(0)} go={go} /> : <Notes stop={stop} on={notesOn(stop.i)} made={dive} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {L && artReady && inCascade && (
          <Market ref={market} L={L} target={target} onLevel={onLevel} onBack={leave} open={reeds === "open"} />
        )}
        <Reeds state={reeds} />
        {!loaderGone && (
          <Loader
            progress={progress}
            ready={artReady && L !== null}
            onLanded={() => {
              setIntro("play");
              setTimeout(() => setIntro("done"), INTRO_MS);
            }}
            onGone={() => setLoaderGone(true)}
          />
        )}
      </Frame>
      {intro === "done" && (
        <button type="button" className={s.made} data-cascade={inCascade || undefined} onClick={inCascade ? leave : () => (st.stop === 1 ? dive() : go(1))}>
          {inCascade ? (
            <>
              <span aria-hidden="true">↑</span> {copy.backToMain}
            </>
          ) : (
            copy.made
          )}
        </button>
      )}
      <NavButtons
        onPrev={() => (inCascade ? market.current?.step(-1) : dispatch({ t: "step", dir: -1 }))}
        onNext={() => (inCascade ? market.current?.step(1) : dispatch({ t: "step", dir: 1 }))}
        atStart={inCascade ? level === 0 && page === 0 : st.to === 0}
        atEnd={inCascade ? level === nav.LEVELS - 1 && page === copy.pages.length - 1 : st.to === nav.LAST}
        vertical={inCascade}
      />
      <StopDots
        items={inCascade ? projects : stops}
        label={inCascade ? copy.levelsLabel : copy.dotsLabel}
        current={inCascade ? level : st.to}
        visited={visited}
        cascade={inCascade}
        onJump={inCascade ? pool : go}
      />
      <Footer />
      <p className={s.live} aria-live="polite">
        {live}
      </p>
    </div>
  );
}
