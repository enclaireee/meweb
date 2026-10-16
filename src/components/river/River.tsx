"use client";
// The river: navigation state, the one rAF loop (glide + pointer smoothing), input, paper notes and chrome.
// The projects index (Projects.tsx) is a sheet over it, with its own history entry (#made-N).
// Per frame it only writes CSS variables; React renders on phase changes.
import { useCallback, useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import { copy, dials, stops } from "@/content/site";
import { camAt, camCss } from "@/lib/camera";
import { layerFx } from "@/lib/fx";
import { createWheelGate, keyIntent, swipeStep } from "@/lib/input";
import { computeLayout, P, PAD, type Layout } from "@/lib/layout";
import * as nav from "@/lib/nav";
import { skyAt, skyBackground } from "@/lib/sky";
import { Frame } from "@/components/frame/Frame";
import { Footer } from "@/components/ui/Footer";
import { Landing } from "@/components/ui/Landing";
import { Notes } from "@/components/ui/Notes";
import { NavButtons } from "@/components/ui/NavButtons";
import { StopDots } from "@/components/ui/StopDots";
import manifest from "../../../public/art/desktop/manifest.json";
import { Projects } from "@/components/projects/Projects";
import { Loader } from "./Loader";
import { INTRO_MS, World } from "./World";
import s from "./river.module.css";

const CAMS = dials.map((d) => d.cam);
/** The tide (river.module.css .tide): four layers, 80 ms apart, 1400 ms each. The top one covers the screen from ~830 to ~1050 ms. */
const TIDE_COVER = 880;
const TIDE_MS = 1640;
const tilesOf = (m: { layers: { tiles: { f: string }[] }[] }, dir: string) =>
  m.layers.flatMap((l) => l.tiles.map((t) => `/art/${dir}/${t.f}`));
const MAIN_TILES = tilesOf(manifest, "desktop");
/** Load and decode tiles before their world mounts, so no layer's content changes after it is on screen. Reports the decoded ratio. */
const preload = (tiles: string[], onProgress: (r: number) => void = () => {}) => {
  let done = 0;
  let raf = 0;
  let timer = 0;
  const report = () => {
    raf = 0;
    onProgress(done / tiles.length);
  };
  return Promise.race([
    Promise.all(
      tiles.map((src) => {
        const img = new Image();
        img.src = src;
        return img
          .decode()
          .catch(() => {})
          .then(() => {
            done++;
            if (done === tiles.length) {
              cancelAnimationFrame(raf);
              onProgress(1);
            } else if (!raf) {
              raf = requestAnimationFrame(report);
            }
          });
      }),
    ),
    new Promise((r) => {
      timer = window.setTimeout(r, 8000); // ponytail: slow network cap; late tiles may still pop in
    }),
  ]).finally(() => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
  });
};

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
  const [madeAt, setMadeAt] = useState<number | null>(null); // the projects index, open at this row (the URL's truth)
  const [shownMade, setShownMade] = useState<number | null>(null); // what is mounted: swaps behind the tide
  const [tide, setTide] = useState<{ dir: "up" | "down"; n: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [intro, setIntro] = useState<"wait" | "play" | "done">("wait");
  const [loaderGone, setLoaderGone] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const fxEls = useRef(new Map<string, { el: HTMLDivElement; fx: string; op: string; ty: string }>());
  const wheel = useRef(createWheelGate());
  const startle = useRef(0);
  const pushed = useRef(false); // the index has its own history entry, so leaving it is history.back()
  const landing = useRef<number | null>(null); // the stop the mount lands on, until it has
  const stRef = useRef(st);
  const madeRef = useRef(madeAt);
  const shownRef = useRef(shownMade);
  useEffect(() => {
    stRef.current = st;
    madeRef.current = madeAt;
    shownRef.current = shownMade;
  });
  const a = useRef({
    pos: 0,
    raf: 0,
    move: null as null | { from: number; to: number; start: number; dur: number },
    ptr: { x: 0, y: 0, tx: 0, ty: 0, last: 0, active: false },
    rect: { left: 0, top: 0, width: 1, height: 1 },
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
  const applyPos = useCallback((p: number, skipCam = false) => {
    a.current.pos = p;
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--pos", p.toFixed(4));
    for (const item of fxEls.current.values()) {
      const f = layerFx(item.fx, p);
      const op = f.opacity.toFixed(3);
      const ty = f.ty.toFixed(1);
      if (op !== item.op) {
        item.op = op;
        item.el.style.opacity = op;
      }
      if (ty !== item.ty) {
        item.ty = ty;
        item.el.style.setProperty("--ty", ty);
      }
    }
    if (skyRef.current) skyRef.current.style.background = skyBackground(skyAt(p));
    if (!skipCam) applyCam();
  }, [applyCam]);

  // The sky (in World) mounts after the deep link's first applyPos: write it again once it's there.
  const worldUp = L !== null && artReady;
  useEffect(() => {
    if (worldUp) applyPos(a.current.pos, true);
  }, [worldUp, applyPos]);

  const fxRef = useCallback(
    (id: string, fx: string) => (el: HTMLDivElement | null) => {
      if (el) {
        const f = layerFx(fx, a.current.pos);
        const op = f.opacity.toFixed(3);
        const ty = f.ty.toFixed(1);
        el.style.opacity = op;
        el.style.setProperty("--ty", ty);
        fxEls.current.set(id, { el, fx, op, ty });
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
      let camDirty = false;
      if (A.move) {
        const { from, to, start, dur } = A.move;
        const t = Math.min(1, (now - start) / dur);
        applyPos(from + (to - from) * nav.easeGlide(t), true);
        camDirty = true;
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
        camDirty = true;
        if (Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) < 0.001) {
          p.active = false;
          p.last = 0;
        } else again = true;
      }
      if (camDirty) applyCam();
      if (again) kick();
    };
  }, [applyPos, applyCam, kick]);

  /** Back to the river where you left it: through history when the index pushed an entry, so the browser's back button agrees. */
  const leave = useCallback(() => {
    if (pushed.current) return history.back(); // hashchange closes it
    const n = stRef.current.stop;
    history.replaceState(null, "", n ? nav.hashFor("main", n) : location.pathname + location.search);
    setMadeAt(null);
  }, []);
  const leaveRef = useRef(leave);
  useEffect(() => {
    leaveRef.current = leave;
  });

  // The tide: going under or surfacing, paper water covers the screen, the sheet swaps behind it, then the water moves on.
  // A row change while under, a deep link behind the loader, and reduced motion swap at once. Timeouts keep setState out of the effect body.
  useEffect(() => {
    if ((madeAt === null) === (shownRef.current === null) || !loaderGone || a.current.reduced) {
      const t = setTimeout(() => {
        setShownMade(madeAt);
        setTide(null);
      }, 0);
      return () => clearTimeout(t);
    }
    const t0 = setTimeout(() => setTide((p) => ({ dir: madeAt === null ? "down" : "up", n: (p?.n ?? 0) + 1 })), 0);
    const t1 = setTimeout(() => setShownMade(madeAt), TIDE_COVER);
    const t2 = setTimeout(() => setTide(null), TIDE_MS);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [madeAt, loaderGone]);

  // Focus follows the sheet: Projects takes it on open, the river gets it back on close.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (shownMade === null && wasOpen.current) document.getElementById("river")?.focus({ preventScroll: true });
    wasOpen.current = shownMade !== null;
  }, [shownMade]);

  // Mount: deep link, reduced motion, layout.
  useEffect(() => {
    let alive = true;
    const place = nav.placeFromHash(location.hash);
    const ready = preload(MAIN_TILES, (r) => alive && setProgress(r));
    void ready.then(() => {
      if (!alive) return;
      if (place?.route === "channel") setMadeAt(place.n);
      setArtReady(true);
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
      a.current.rect = { left: r.left, top: r.top, width: r.width || 1, height: r.height || 1 };
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
      pushed.current = p.route === "channel"; // a #made-N entry of its own (forward, or typed)
      if (p.route === "channel") setMadeAt(p.n);
      else {
        setMadeAt(null);
        dispatch({ t: "jump", n: p.n });
      }
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
    if (nav.placeFromHash(location.hash)?.route !== "channel" && !early) history.replaceState(null, "", st.stop ? nav.hashFor("main", st.stop) : location.pathname + location.search);
    // A 0 ms timeout keeps setState out of the effect body. The first stop's notes also wait for the intro (notesOn).
    const t1 = setTimeout(() => setShown(true), 0);
    return () => clearTimeout(t1);
  }, [st.phase, st.stop]);

  // Inputs: keyboard on window, wheel and touch on the stage.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof Element ? e.target : document.body;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (madeRef.current !== null) {
        if (e.key === "Escape") leaveRef.current();
        return; // the index scrolls natively
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
      const r = a.current.rect;
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

  const away = shownMade !== null;
  const travellerState = st.phase === "moving" ? traveller : looking ? "looking" : "idle";
  const moving = st.phase === "moving";
  const resting = L !== null && artReady && !moving; // L is set after the mount effect has applied the deep link
  const here = stops[st.stop]!;
  const live = !resting || away ? "" : `Stop ${st.stop + 1} of ${stops.length}, ${here.place}: ${here.tag.title}`;
  // Adjusting state during render (React's sanctioned pattern): remember stops once settled on them.
  if (resting && !visited.includes(here.id)) setVisited([...visited, here.id]);
  const notesOn = (i: number) => resting && shown && intro !== "wait" && i === st.stop;
  const go = (n: number) => dispatch({ t: "jump", n });
  /** Open the projects index at row n, on a history entry of its own. */
  const openMade = (n = 0) => {
    if (madeRef.current === null) {
      history.pushState(null, "", nav.hashFor("channel", n));
      pushed.current = true;
    }
    setMadeAt(n);
  };

  // Tap the scene: a ripple ring where you touched, and the fireflies startle. Not on buttons, not under reduced motion.
  const ripple = (e: React.MouseEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || a.current.reduced || (e.target as Element).closest("button, a, [data-note]")) return;
    const r = a.current.rect;
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
          data-away={away || undefined}
          inert={away}
          onClick={ripple}
        >
          {L && artReady && (
            <>
              <World L={L} ffActive={st.to} travellerState={travellerState} fxRef={fxRef} skyRef={skyRef} lifeStop={st.stop} lifeOn={!moving} intro={intro} />
              <div className={s.tags} id="river" tabIndex={-1}>
                {L.compact ? (
                  st.stop === 0 ? (
                    <Landing on={notesOn(0)} go={go} made={openMade} flow />
                  ) : (
                    <Notes key={st.stop} stop={stops[st.stop]!} on={notesOn(st.stop)} made={openMade} flow />
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
                        {stop.i === 0 ? <Landing on={notesOn(0)} go={go} made={openMade} /> : <Notes stop={stop} on={notesOn(stop.i)} made={openMade} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {away && <Projects at={shownMade} onClose={leave} />}
        {tide && (
          <div key={tide.n} className={s.tide} data-dir={tide.dir} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} style={{ "--i": i } as CSSProperties} />
            ))}
          </div>
        )}
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
      {/* the sheet has its own way back; the river's chrome waits under it */}
      <div hidden={away}>
        {intro !== "wait" && (
          <button type="button" className={s.made} onClick={() => openMade()}>
            {copy.made}
          </button>
        )}
        <NavButtons onPrev={() => dispatch({ t: "step", dir: -1 })} onNext={() => dispatch({ t: "step", dir: 1 })} atStart={st.to === 0} atEnd={st.to === nav.LAST} />
        <StopDots items={stops} label={copy.dotsLabel} current={st.to} visited={visited} onJump={go} />
      </div>
      <Footer />
      <p className={s.live} aria-live="polite">
        {live}
      </p>
    </div>
  );
}
