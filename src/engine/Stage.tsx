'use client';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { InitialLaneCtx } from './hooks';
import { emitFrame, getState, initLane, laneIO, SERVER_STATE, setState, subscribe } from './store';
import { beatRanges, clampS, coverScale, dissolve, evaluate, locate, mountWindow, pickComposition, type Range } from './timeline';
import type { BeatDef, Comp, Lane, ManifestLayer, Pose, Quality, Track } from './types';

const PARALLAX_MAX = 24; // design px (CSS px for viewport overlays) at parallax 1
const TURN_MS = 380;
const COMPS: Comp[] = ['desktop', 'portrait'];

/** hide: how a node disappears at opacity 0. 'vis' = visibility:hidden (overlays: no clicks/focus);
 *  'off' = data-off attribute (beat groups: overlays hidden by CSS). */
type Node = { el: HTMLElement; tf?: string; op?: number; vis?: boolean; hide?: 'vis' | 'off' };
/** w/h = size the x/y keyframes are relative to (design px); 0 = viewport overlay, CSS px. */
type Driven = Node & { track?: Track; parallax: number; w: number; h: number };
/** An art layer, drawn into the beat's <canvas>. ox/oy = transform origin as a fraction of the layer box. */
type Art = { img: HTMLImageElement; l: ManifestLayer; track?: Track; parallax: number; ox: number; oy: number };
type Mounted = {
  index: number; def: BeatDef; comp: Comp; ranges: Range[];
  W: number; H: number; origin: [number, number]; group: Node; canvas: Node[]; items: Driven[];
  /** cv2 + split: art from index `split` on is drawn on a second canvas, above `behind` overlays. */
  cv: HTMLCanvasElement; cv2: HTMLCanvasElement | null; split: number; art: Art[]; t?: string;
};

// Engine singleton (one Stage per page). Mutated only from effects, events and rAF, never in render.
const E = {
  ranges: [] as Range[],
  lane: 'main' as Lane,
  unit: 1, w: 1, h: 1, tau: 0.07, res: 1,
  s: 0, cur: -1, dirty: true,
  px: 0, py: 0, tx: 0, ty: 0, // pointer: smoothed / target, -1..1
  live: new Map<number, Mounted>(),
  setWin: (() => {}) as (w: [number, number]) => void,
};

const r3 = (v: number) => Math.round(v * 1000) / 1000;
const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
const unit = (v: number, size: number) => (size ? `${r3((v / size) * 100)}%` : `${r3(v)}px`);

function tf(p: Pose, w: number, h: number) {
  return `translate3d(${unit(p.x, w)},${unit(p.y, h)},0)` +
    (p.rotate ? ` rotate(${r3(p.rotate)}deg)` : '') +
    (p.rotateY ? ` rotateY(${r3(p.rotateY)}deg)` : '') +
    (p.scale !== 1 ? ` scale(${r3(p.scale)})` : '');
}
const groupTf = (g: Pose, W: number, H: number) => `translate(-50%,-50%) ${tf(g, W, H)}`;

function put(n: Node, transform: string | null, opacity: number) {
  if (transform !== null && transform !== n.tf) n.el.style.transform = n.tf = transform;
  const o = r3(opacity);
  if (o !== n.op) n.el.style.opacity = String((n.op = o));
  const vis = o > 0;
  if (!n.hide || vis === n.vis) return;
  n.vis = vis;
  if (n.hide === 'off') n.el.toggleAttribute('data-off', !vis);
  else n.el.style.visibility = vis ? '' : 'hidden';
}

const PERSPECTIVE = 2000; // CSS px, as the old DOM canvas had
const STRIPS = 32; // vertical slices for a rotateY layer (true perspective taper)

/**
 * Art is drawn into one <canvas> per beat instead of one composited <img> layer each.
 * Why: 16 layers x 3 mounted beats, each rastered at full retina size, blew past Chromium's GPU tile
 * budget on large screens; tiles got dropped and layers flashed blank mid-transition. A canvas is one
 * texture at a capped resolution (E.res), so there is nothing to drop. Geometry matches the old CSS:
 * cover-fit canvas box, group transform about groupOrigin, layer transform about its own origin.
 */
function prep(cv: HTMLCanvasElement) {
  const bw = Math.round(E.w * E.res), bh = Math.round(E.h * E.res);
  if (cv.width !== bw || cv.height !== bh) {
    cv.width = bw;
    cv.height = bh;
  }
  const ctx = cv.getContext('2d');
  ctx?.setTransform(1, 0, 0, 1, 0, 0);
  ctx?.clearRect(0, 0, bw, bh);
  return ctx;
}

function draw(m: Mounted, g: Pose, ft: number, t: number, rm: boolean, par: boolean) {
  const { W, H } = m;
  let ctx = prep(m.cv);
  if (!ctx) return;
  const k = Math.max(E.w / W, E.h / H); // CSS px per design px (cover)
  const [ox, oy] = m.origin;
  const base = new DOMMatrix()
    .scaleSelf(E.res).translateSelf(E.w / 2, E.h / 2).scaleSelf(k)
    .translateSelf(ox - W / 2 + g.x, oy - H / 2 + g.y).rotateSelf(g.rotate).scaleSelf(g.scale).translateSelf(-ox, -oy);
  const P = PERSPECTIVE / k;
  for (const [i, a] of m.art.entries()) {
    if (i === m.split && m.cv2) {
      ctx.globalAlpha = 1;
      ctx = prep(m.cv2);
      if (!ctx) return;
    }
    const { img, l } = a;
    if (!img.complete || !img.naturalWidth) continue;
    const p = evaluate(a.track, ft);
    if (rm && a.track) p.opacity = evaluate(a.track, t).opacity;
    if (p.opacity <= 0) continue;
    if (par && a.parallax) {
      p.x += E.px * a.parallax * PARALLAX_MAX;
      p.y += E.py * a.parallax * PARALLAX_MAX;
    }
    ctx.globalAlpha = Math.min(1, p.opacity);
    const Ox = a.ox * l.w, Oy = a.oy * l.h;
    const ax = l.x + Ox + p.x, ay = l.y + Oy + p.y; // origin in design px after translate
    if (!p.rotateY) {
      const M = base.translate(ax, ay).rotateSelf(p.rotate).scaleSelf(p.scale).translateSelf(-Ox, -Oy);
      ctx.setTransform(M);
      ctx.drawImage(img, 0, 0, l.w, l.h);
      continue;
    }
    // rotateY: project each strip's edges through the perspective (origin = canvas box centre).
    ctx.setTransform(base);
    const th = (p.rotateY * Math.PI) / 180, cos = Math.cos(th), sin = Math.sin(th);
    const proj = (u: number) => {
      const r = (u - Ox) * p.scale;
      const f = P / (P + r * sin); // z = -r sin(th)
      const x = W / 2 + (ax + r * cos - W / 2) * f;
      const top = H / 2 + (ay - Oy * p.scale - H / 2) * f;
      const bot = H / 2 + (ay + (l.h - Oy) * p.scale - H / 2) * f;
      return { x, top, bot };
    };
    const sx = img.naturalWidth / l.w;
    for (let i = 0; i < STRIPS; i++) {
      const u0 = (l.w * i) / STRIPS, u1 = (l.w * (i + 1)) / STRIPS, du = u1 - u0;
      const L = proj(u0), R = proj(u1);
      ctx.save();
      ctx.transform((R.x - L.x) / du, (R.top - L.top) / du, 0, (L.bot - L.top) / l.h, L.x - ((R.x - L.x) / du) * u0, L.top - ((R.top - L.top) / du) * u0);
      ctx.drawImage(img, u0 * sx, 0, du * sx, img.naturalHeight, u0, 0, du + 0.5, l.h); // +0.5: no seam
      ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}

function applyBeat(m: Mounted, s: number) {
  const { def, index, ranges } = m;
  const r = ranges[index];
  if (!r) return;
  const cd = def[m.comp];
  const st = getState();
  const rm = st.reducedMotion;
  const t = (s - r.start) / def.screens;
  const ft = rm ? (def.still ?? 0.5) : t; // reduced motion: transforms frozen, opacity still follows t
  const g = evaluate(cd.group, ft);
  const op = rm ? dissolve(s, ranges, index) : cd.group ? g.opacity : locate(ranges, s) === index ? 1 : 0;
  put(m.group, null, op);
  if (op <= 0) {
    // Hidden beat: drop its canvas backing stores (prep() reallocates on the next visible frame, before paint).
    for (const c of [m.cv, m.cv2]) if (c?.width) c.width = c.height = 0;
    return;
  }
  for (const c of m.canvas) put(c, groupTf(g, m.W, m.H), 1);
  // --t: local beat progress for CSS-staggered text (see .at in globals.css).
  const tv = (Math.round(t * 1e4) / 1e4).toString();
  if (tv !== m.t) m.group.el.style.setProperty('--t', (m.t = tv));
  const par = !rm && st.quality === 'high';
  draw(m, g, ft, t, rm, par);
  for (const d of m.items) {
    const p = evaluate(d.track, ft);
    if (rm && d.track) p.opacity = evaluate(d.track, t).opacity;
    if (par && d.parallax) {
      p.x += E.px * d.parallax * PARALLAX_MAX;
      p.y += E.py * d.parallax * PARALLAX_MAX;
    }
    put(d, tf(p, d.w, d.h), p.opacity);
  }
  def.onProgress?.(t, m.group.el, {
    comp: m.comp, reducedMotion: rm, quality: st.quality, s, k: coverScale(E.w, E.h, m.W, m.H),
  });
}

function render(velocity: number) {
  const idx = locate(E.ranges, E.s);
  if (idx !== E.cur) E.setWin(mountWindow((E.cur = idx), E.ranges.length));
  for (const m of E.live.values()) applyBeat(m, E.s);
  const r = E.ranges[idx];
  const total = E.ranges.at(-1)?.end ?? 0;
  emitFrame({
    lane: E.lane, s: E.s, velocity, beat: idx, unit: E.unit,
    progress: total ? Math.min(1, Math.max(0, E.s / total)) : 0,
    t: r ? (E.s - r.start) / (r.end - r.start) : 0,
    pointer: { x: E.px, y: E.py },
  });
  E.dirty = false;
}

function mount(index: number, def: BeatDef, comp: Comp, ranges: Range[], el: HTMLElement): Mounted {
  const c = def.manifest.compositions[comp];
  const cd = def[comp];
  const items: Driven[] = [];
  const art: Art[] = [];
  el.querySelectorAll<HTMLImageElement>('img[data-layer]').forEach((img) => {
    const l = c.layers.find((x) => x.id === img.dataset.layer);
    if (!l) return;
    const a = cd.layers?.[l.id];
    const [ox = 0.5, oy = 0.5] = (a?.origin ?? '').split(/\s+/).filter(Boolean).map((v) => parseFloat(v) / 100);
    art.push({ img, l, track: a?.track, parallax: a?.parallax ?? 0, ox, oy });
  });
  el.querySelectorAll<HTMLElement>('[data-ov]').forEach((n) => {
    const o = cd.overlays?.[Number(n.dataset.ov)];
    if (o) items.push({ el: n, hide: 'vis', track: o.track, parallax: o.parallax ?? 0, w: o.rect?.w ?? 0, h: o.rect?.h ?? 0 });
  });
  return {
    index, def, comp, ranges, W: c.width, H: c.height, items, art,
    origin: cd.groupOrigin ?? [c.width / 2, c.height / 2],
    cv: el.querySelector<HTMLCanvasElement>('canvas[data-art]')!,
    cv2: el.querySelector<HTMLCanvasElement>('canvas[data-art2]'),
    split: cd.split ? art.findIndex((a) => a.l.id === cd.split) : -1,
    group: { el: el.querySelector<HTMLElement>('[data-comp]')!, hide: 'off' },
    canvas: [...el.querySelectorAll<HTMLElement>('[data-canvas]')].map((e) => ({ el: e })),
  };
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

function Composition({ def, comp, quality, visible, t0, gate }: {
  def: BeatDef; comp: Comp; quality: Quality; visible: boolean; t0: number; gate?: string;
}) {
  const { width: W, height: H, layers } = def.manifest.compositions[comp];
  const cd = def[comp];
  const g = evaluate(cd.group, t0);
  const [ox, oy] = cd.groupOrigin ?? [W / 2, H / 2];
  const low = quality === 'low';
  const ssr = gate !== undefined; // before hydration: plain <img> layers (first paint, no JS); after: drawn into <canvas data-art>
  const ovs = (cd.overlays ?? []).map((o, i) => ({ o, i })).filter(({ o }) => !(low && o.highOnly));
  const ovStyle = (o: (typeof ovs)[number]['o'], w: number, h: number) => {
    const p = evaluate(o.track, t0);
    return { ...o.style, transform: tf(p, w, h), opacity: p.opacity };
  };
  const box = {
    width: `max(100%, ${(W / H) * 100}lvh)`, aspectRatio: `${W} / ${H}`,
    transformOrigin: `${pct(ox, W)} ${pct(oy, H)}`, transform: groupTf(g, W, H), willChange: 'transform',
  };
  const behind = cd.split ? ovs.filter(({ o }) => o.rect && o.behind) : [];
  const rectOv = ({ o, i }: (typeof ovs)[number]) => (
    <div
      key={`ov${i}`} data-ov={i} className={`pointer-events-auto [[data-off]_&]:invisible ${o.className ?? ''}`}
      style={{
        position: 'absolute', left: pct(o.rect!.x, W), top: pct(o.rect!.y, H),
        width: pct(o.rect!.w, W), height: pct(o.rect!.h, H), ...ovStyle(o, o.rect!.w, o.rect!.h),
      }}
    >
      {o.node}
    </div>
  );
  return (
    <div
      data-comp={comp}
      data-off={visible && g.opacity > 0 ? undefined : ''}
      className={`absolute inset-0 ${gate ?? ''}`}
      style={{ opacity: visible ? g.opacity : 0, willChange: 'opacity' }}
    >
      {!ssr && <canvas data-art className="absolute inset-0 h-full w-full" />}
      {!ssr && behind.length > 0 && <div data-canvas className="absolute left-1/2 top-1/2" style={box}>{behind.map(rectOv)}</div>}
      {!ssr && cd.split && <canvas data-art2 className="absolute inset-0 h-full w-full" />}
      <div data-canvas className="absolute left-1/2 top-1/2" style={{ ...box, perspective: '2000px' }}>
        {[...layers].sort((a, b) => a.depth - b.depth).map((l) => {
          const a = cd.layers?.[l.id];
          if (low && a?.highOnly) return null;
          const p = evaluate(a?.track, t0);
          return [
            ssr && l.id === cd.split && behind.map(rectOv),
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={l.id} data-layer={l.id} src={l.src} alt="" draggable={false} decoding="async"
              loading={ssr ? 'lazy' : undefined}
              onLoad={() => void (E.dirty = true)}
              // After hydration the <img> is only the canvas's source: display:none, never composited.
              style={ssr ? {
                position: 'absolute', maxWidth: 'none',
                left: pct(l.x, W), top: pct(l.y, H), width: pct(l.w, W), height: pct(l.h, H),
                transformOrigin: a?.origin, transform: a?.track ? tf(p, l.w, l.h) : undefined,
                opacity: a?.track ? p.opacity : undefined,
                // Fixed raster scale: the dolly/dive scale changes every frame, which would otherwise re-raster.
                willChange: a?.track || a?.parallax ? 'transform, opacity' : undefined,
              } : { display: 'none' }}
            />,
          ];
        })}
        {ovs.filter(({ o }) => o.rect && !o.behind).map(rectOv)}
      </div>
      {ovs.filter(({ o }) => !o.rect).map(({ o, i }) => (
        <div key={i} data-ov={i} className={`absolute pointer-events-auto [[data-off]_&]:invisible ${o.className ?? ''}`} style={ovStyle(o, 0, 0)}>
          {o.node}
        </div>
      ))}
    </div>
  );
}

/** first/t0: the beat shown before hydration (the one holding initialS) and its local t, for SSR poses. */
function Beat({ def, index, ranges, comp, quality, first, t0 }: {
  def: BeatDef; index: number; ranges: Range[]; comp: Comp | null; quality: Quality; first: boolean; t0: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!comp || !ref.current) return;
    const m = mount(index, def, comp, ranges, ref.current);
    E.live.set(index, m);
    applyBeat(m, E.s); // before paint: no unstyled frame
    // Decode now, while the beat is still off-screen, so its first visible frame is not a blank one.
    ref.current.querySelectorAll('img').forEach((i) => void i.decode().catch(() => {}));
    return () => {
      if (E.live.get(index) === m) E.live.delete(index);
    };
  }, [def, index, ranges, comp, quality]);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      {/* Before hydration the viewport is unknown: render both, CSS picks by orientation. Keyed so the kept one is not remounted. */}
      {(comp ? [comp] : COMPS).map((c) => (
        <Composition key={c} def={def} comp={c} quality={quality} visible={first} t0={t0}
          gate={comp ? undefined : c === 'desktop' ? 'portrait:hidden' : 'landscape:hidden'} />
      ))}
    </div>
  );
}

export type StageProps = {
  beats: BeatDef[];
  projectBeats: BeatDef[];
  initialLane?: Lane;
  initialFocusId?: string;
  /** Start position (screens, lane-local) of the initial lane on first load, e.g. a project deep link.
   *  Server-rendered at that beat; applied on mount unless the browser already restored a scroll position. */
  initialS?: number;
  /** Progress smoothing time constant in seconds; 0 = off. Always off under reduced motion. */
  smoothing?: number;
  /** Persistent nodes inside the turning stage, above the beats (e.g. the paper frame). */
  overlay?: ReactNode;
  /** Rendered after the stage, not turned (nav). */
  children?: ReactNode;
};

export function Stage({ beats, projectBeats, initialLane = 'main', initialFocusId, initialS, smoothing = 0.07, overlay, children }: StageProps) {
  const st = useSyncExternalStore(subscribe, getState, () => SERVER_STATE);
  const lane = st.lane ?? initialLane;
  const list = lane === 'main' ? beats : projectBeats;
  const ranges = beatRanges(list);
  const total = ranges.at(-1)?.end ?? 0;
  // First-render snapshot (same on server and client): where the initial lane starts.
  const [init] = useState(() => {
    const s = clampS(initialS ?? 0, total);
    const i = locate(ranges, s);
    const r = ranges[i];
    return { s, i, t: r ? (s - r.start) / (r.end - r.start) : 0 };
  });
  const [[lo, hi], setWin] = useState<[number, number]>([init.i, init.i]);
  const [comp, setComp] = useState<Comp | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const turnRef = useRef<HTMLDivElement>(null);

  // Loop inputs follow the rendered lane; layout effect so it is current inside the flushSync of a lane swap.
  useLayoutEffect(() => {
    E.ranges = ranges;
    E.lane = lane;
    E.dirty = true;
  }, [ranges, lane]);

  useEffect(() => {
    E.tau = smoothing;
  }, [smoothing]);

  useEffect(() => {
    initLane(initialLane, initialFocusId);
    return () => initLane(null);
  }, [initialLane, initialFocusId]);

  useEffect(() => {
    const stage = stageRef.current!;
    E.setWin = setWin;
    E.cur = -1;
    E.dirty = true;

    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2) setState({ quality: 'low' });
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => {
      setState({ reducedMotion: mq.matches });
      E.dirty = true;
    };
    onMq();
    mq.addEventListener('change', onMq);

    const measure = () => {
      const old = E.unit;
      const s = scrollY / old;
      E.w = stage.clientWidth || 1;
      E.h = E.unit = stage.clientHeight || 1;
      // Canvas backing scale: full DPR up to 2x, within ~8 MP per canvas. Hidden beats free theirs, so at most
      // two beats (four canvases with splits) hold memory, during a crossfade.
      E.res = Math.min(devicePixelRatio || 1, getState().quality === 'low' ? 1 : 2, Math.sqrt(8e6 / (E.w * E.h)));
      // Keep the same place in the story when the viewport height really changes (rotation, window resize).
      if (old > 1 && E.unit !== old) {
        window.scrollTo({ top: s * E.unit, behavior: 'instant' });
        E.s = s;
      }
      E.dirty = true;
      return pickComposition(E.w, E.h);
    };
    E.unit = 1;
    measure(); // sync, so the first tick already has the real unit
    // Deep link start; skipped if the browser restored a position (reload) or on the Strict Mode re-run.
    if (init.s > 0 && scrollY < 1) window.scrollTo({ top: init.s * E.unit, behavior: 'instant' });
    E.s = scrollY / E.unit; // no glide from 0 after a reload mid-page
    const ro = new ResizeObserver(() => setComp(measure()));
    ro.observe(stage);

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      E.tx = clamp1((e.clientX / E.w) * 2 - 1);
      E.ty = clamp1((e.clientY / innerHeight) * 2 - 1);
    };
    // ponytail: gyro only where it fires without a permission prompt (not iOS); add requestPermission on a gesture if wanted.
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      E.tx = clamp1(e.gamma / 30);
      E.ty = clamp1((e.beta - 45) / 30);
    };
    addEventListener('pointermove', onPointer, { passive: true });
    addEventListener('deviceorientation', onTilt);

    const io = { ...laneIO };
    laneIO.getUnit = () => E.unit;
    laneIO.getLength = () => E.ranges.at(-1)?.end ?? 0;
    laneIO.commit = (fn) => flushSync(fn);
    laneIO.setY = (y) => {
      window.scrollTo({ top: y, behavior: 'instant' });
      E.s = window.scrollY / E.unit;
      E.cur = locate(E.ranges, E.s);
      flushSync(() => setWin(mountWindow(E.cur, E.ranges.length)));
      render(0);
    };
    laneIO.turn = async (swap) => {
      const el = turnRef.current;
      if (!el) return swap();
      const rm = getState().reducedMotion;
      const dir = getState().lane === 'main' ? 1 : -1;
      const kf = (deg: number, o: number) => (rm ? { opacity: o } : { transform: `rotateY(${deg}deg)` });
      const run = (a: Keyframe, b: Keyframe, easing: string) =>
        el.animate([a, b], { duration: rm ? 200 : TURN_MS, easing, fill: 'forwards' }).finished;
      await run(kf(0, 1), kf(90 * dir, 0), 'ease-in'); // edge-on: content swap is invisible
      swap();
      await run(kf(-90 * dir, 0), kf(0, 1), 'ease-out');
      el.getAnimations().forEach((a) => a.cancel());
    };

    let raf = 0;
    let last = 0;
    let samples = 0;
    let sum = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      const s = getState();
      const target = scrollY / E.unit;
      const prev = E.s;
      const tau = s.reducedMotion ? 0 : E.tau;
      E.s = tau ? E.s + (target - E.s) * (1 - Math.exp(-dt / tau)) : target;
      if (Math.abs(target - E.s) < 1e-4) E.s = target;

      const par = !s.reducedMotion && s.quality === 'high';
      const tx = par ? E.tx : 0;
      const ty = par ? E.ty : 0;
      let moved = E.dirty || E.s !== prev;
      if (Math.abs(tx - E.px) + Math.abs(ty - E.py) > 1e-3) {
        const k = 1 - Math.exp(-dt / 0.15);
        E.px += (tx - E.px) * k;
        E.py += (ty - E.py) * k;
        moved = true;
      }
      if (!moved) return;
      // Frame-time sampling while scrolling; one-way downgrade.
      if (E.s !== prev && s.quality === 'high' && samples < 60) {
        sum += dt;
        if (++samples === 60 && sum / 60 > 0.024) setState({ quality: 'low' });
      }
      render((E.s - prev) / dt);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mq.removeEventListener('change', onMq);
      removeEventListener('pointermove', onPointer);
      removeEventListener('deviceorientation', onTilt);
      Object.assign(laneIO, io);
      E.setWin = () => {};
    };
  }, [init]);

  return (
    <InitialLaneCtx.Provider value={{ lane: initialLane, focusId: initialFocusId }}>
      <div ref={stageRef} className="fixed left-0 top-0 h-lvh w-full overflow-clip" style={{ perspective: '1600px' }}>
        <div ref={turnRef} className="absolute inset-0">
          {list.slice(lo, hi + 1).map((def, j) => (
            <Beat key={`${lane}:${lo + j}`} def={def} index={lo + j} ranges={ranges} comp={comp} quality={st.quality}
              first={lo + j === init.i} t0={lo + j === init.i ? init.t : 0} />
          ))}
          {overlay}
        </div>
      </div>
      <div aria-hidden style={{ height: `${(total + 1) * 100}lvh` }} />
      {children}
    </InitialLaneCtx.Provider>
  );
}
