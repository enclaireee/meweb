'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { enterLane, exitLane, subscribeFrame, useLane } from '@/engine';
import { profile, ui } from '@/content';
import { useLang, useT } from './lang';

/* ---------- deterministic scissor-cut SVG paper generator ---------- */
type Pt = [number, number];

function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();
const toPath = (pts: Pt[]) =>
  `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L')}Z`;

/** Subdivide edge a->b into scissor-cut segments with perpendicular jitter and an optional torn bite. */
function edgePts(
  a: Pt,
  b: Pt,
  r: () => number,
  step: number,
  jit: number,
  biteAt?: number,
): Pt[] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const n = Math.max(2, Math.round(len / step));
  const pts: Pt[] = [a];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const j = (r() - 0.5) * 2 * jit;
    const px = a[0] + dx * t + nx * j;
    const py = a[1] + dy * t + ny * j;
    if (biteAt !== undefined && i === biteAt) {
      // Torn notch inward (+normal points inward on clockwise rect).
      const bw = 3.5;
      const bd = 3 + r() * 1.5;
      const ux = dx / len;
      const uy = dy / len;
      pts.push(
        [px - ux * bw, py - uy * bw],
        [px - ux * (bw * 0.45) + nx * bd, py - uy * (bw * 0.45) + ny * bd],
        [px + ux * (bw * 0.55) + nx * (bd * 0.9), py + uy * (bw * 0.55) + ny * (bd * 0.9)],
        [px + ux * bw, py + uy * bw],
      );
    } else {
      pts.push([px, py]);
    }
  }
  return pts;
}

/** Octagonal scissor-cut eyelet hole (wound counter-clockwise for even-odd punch). */
function eyeletPath(cx: number, cy: number, rad: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (-i * Math.PI) / 4;
    const k = i % 2 === 0 ? 1 : 0.94;
    pts.push([cx + Math.cos(a) * rad * k, cy + Math.sin(a) * rad * k]);
  }
  return toPath(pts);
}

function buildCutSheet(
  w: number,
  h: number,
  seed: number,
  opts: { fold?: boolean; hole?: [number, number, number] } = {},
) {
  const r = makeRng(seed);
  const m = 4;
  const f = opts.fold ? 15 : 0;
  const tl: Pt = [m + (r() - 0.5) * 1.6, m + (r() - 0.5) * 1.6];
  const trA: Pt = [w - m - f + (r() - 0.5) * 1.2, m + (r() - 0.5) * 1.2];
  const trB: Pt = [w - m + (r() - 0.5) * 1.2, m + f + (r() - 0.5) * 1.2];
  const br: Pt = [w - m + (r() - 0.5) * 1.6, h - m + (r() - 0.5) * 1.6];
  const bl: Pt = [m + (r() - 0.5) * 1.6, h - m + (r() - 0.5) * 1.6];

  const top = edgePts(tl, trA, r, 16, 1.3, w > 110 ? 3 : undefined);
  const right = edgePts(opts.fold ? trB : trA, br, r, 13, 1.2);
  const bottom = edgePts(br, bl, r, 16, 1.3, w > 110 ? 4 : 2);
  const left = edgePts(bl, tl, r, 13, 1.2);

  const outer = [...top, ...right, ...bottom, ...left];
  const body = toPath(outer) + (opts.hole ? eyeletPath(...opts.hole) : '');
  // Lit rim runs along left + top edges (key light upper-left, matching art-bible).
  const rimPts = [...left.slice().reverse(), ...top.slice(1)];
  const rim = `M${rimPts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L')}`;
  const foldPts = opts.fold
    ? {
        flap: toPath([trA, [trA[0], trB[1]], trB]),
        shadow: toPath([[trA[0], trB[1]], trB, [trA[0] + 6, trB[1] + 5]]),
      }
    : null;

  return { body, rim, foldPts };
}

type PaperTheme = {
  back: string;
  front: string;
  frontHover: string;
  rim: string;
  fold: string;
  foldShadow: string;
  glow: string;
  glowHover: string;
  grainOpacity: number;
};

const THEMES: Record<'lantern' | 'cream' | 'night' | 'nightLit', PaperTheme> = {
  lantern: {
    back: '#bd6d1e',
    front: '#ffd778',
    frontHover: '#ffe59c',
    rim: '#fff8e2',
    fold: '#fff1c4',
    foldShadow: 'rgba(110, 52, 8, 0.32)',
    glow: 'drop-shadow(0 0 16px rgba(255, 196, 86, 0.5)) drop-shadow(0 4px 10px rgba(3, 6, 12, 0.65))',
    glowHover: 'drop-shadow(0 0 24px rgba(255, 210, 108, 0.78)) drop-shadow(0 6px 14px rgba(3, 6, 12, 0.75))',
    grainOpacity: 0.14,
  },
  cream: {
    back: '#c88d42',
    front: '#f6ecd6',
    frontHover: '#fff7e6',
    rim: '#ffffff',
    fold: '#fffcf4',
    foldShadow: 'rgba(92, 68, 40, 0.26)',
    glow: 'drop-shadow(0 0 14px rgba(255, 206, 122, 0.32)) drop-shadow(0 5px 12px rgba(3, 6, 12, 0.72))',
    glowHover: 'drop-shadow(0 0 22px rgba(255, 216, 140, 0.55)) drop-shadow(0 7px 16px rgba(3, 6, 12, 0.8))',
    grainOpacity: 0.16,
  },
  night: {
    back: '#263a56',
    front: '#0f1826',
    frontHover: '#17253a',
    rim: 'rgba(159, 184, 207, 0.55)',
    fold: '#2a3f5e',
    foldShadow: 'rgba(2, 4, 10, 0.5)',
    glow: 'drop-shadow(0 4px 10px rgba(3, 6, 12, 0.75))',
    glowHover: 'drop-shadow(0 0 14px rgba(255, 205, 110, 0.28)) drop-shadow(0 6px 14px rgba(3, 6, 12, 0.82))',
    grainOpacity: 0.1,
  },
  nightLit: {
    back: '#c4792b',
    front: '#131d2d',
    frontHover: '#1a283d',
    rim: 'rgba(255, 210, 122, 0.85)',
    fold: '#ffd27a',
    foldShadow: 'rgba(2, 4, 10, 0.5)',
    glow: 'drop-shadow(0 0 14px rgba(255, 184, 102, 0.38)) drop-shadow(0 4px 10px rgba(3, 6, 12, 0.78))',
    glowHover: 'drop-shadow(0 0 20px rgba(255, 200, 110, 0.55)) drop-shadow(0 6px 14px rgba(3, 6, 12, 0.82))',
    grainOpacity: 0.1,
  },
};

/** Layered SVG cut-paper sheets behind a button or link. Never clips focus rings. */
function PaperSheets({
  theme,
  w,
  h = 56,
  seed,
  hole,
  holeGlow,
  tilt = '-0.8deg',
}: {
  theme: keyof typeof THEMES;
  w: number;
  h?: number;
  seed: number;
  hole?: [number, number, number];
  holeGlow?: string;
  tilt?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const p = THEMES[theme];
  const back = buildCutSheet(w, h, seed + 17);
  const front = buildCutSheet(w, h, seed, { fold: true, hole });
  const patternId = `grain-${uid}`;

  return (
    <span
      aria-hidden
      className="paper-svg-wrap pointer-events-none absolute inset-0 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:rotate-0 motion-reduce:transition-none"
      style={{
        transform: `rotate(${tilt})`,
        ['--paper-glow' as string]: p.glow,
        ['--paper-glow-hover' as string]: p.glowHover,
      }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="paper-svg-glow size-full overflow-visible"
      >
        <defs>
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="96" height="96">
            <image href="/art/_grain.webp" width="96" height="96" opacity={p.grainOpacity} />
          </pattern>
        </defs>
        {/* Hard shadow sheet under the stack */}
        <path d={back.body} transform="translate(3.5, 5)" fill="#03060c" fillOpacity="0.58" />
        {/* Under-sheet, tilted slightly askew */}
        <path
          d={back.body}
          transform={`translate(2, 2.5) rotate(1.7 ${w / 2} ${h / 2})`}
          fill={p.back}
        />
        {/* Optional warm core peeking through the punched eyelet hole */}
        {hole && holeGlow && (
          <circle cx={hole[0]} cy={hole[1]} r={hole[2] + 1.5} fill={holeGlow} />
        )}
        {/* Main scissor-cut front sheet */}
        <path
          d={front.body}
          fill={p.front}
          fillRule="evenodd"
          className="paper-front"
          style={{ ['--front' as string]: p.front, ['--front-hover' as string]: p.frontHover }}
        />
        {/* Subtle paper fiber tooth */}
        <path d={front.body} fill={`url(#${patternId})`} fillRule="evenodd" />
        {/* Lit top-left cut edge */}
        <path
          d={front.rim}
          fill="none"
          stroke={p.rim}
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Dog-ear folded corner flap + cast shadow */}
        {front.foldPts && (
          <>
            <path d={front.foldPts.shadow} fill={p.foldShadow} />
            <path d={front.foldPts.flap} fill={p.fold} />
          </>
        )}
      </svg>
    </span>
  );
}

/* ---------- Icons ---------- */
function DoorIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0 fill-none stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14V7a4 4 0 0 1 8 0v7" />
      <path d="M2.5 14h11" />
      <circle cx="8" cy="8.5" r="1.1" className="fill-current stroke-none" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="hidden size-3.5 shrink-0 fill-none stroke-current sm:block" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 13 6.2 4.5 9.2 9.5l1.8-2.8L14.5 13Z" />
    </svg>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0 fill-none stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 6.2H5l3.5-2.7v9L5 9.8H2.5Z" />
      {on ? (
        <>
          <path d="M11 5.6a3.4 3.4 0 0 1 0 4.8" />
          <path d="M13 3.8a6 6 0 0 1 0 8.4" />
        </>
      ) : (
        <path d="m11 6 3 4m0-4-3 4" />
      )}
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 shrink-0 fill-none stroke-current transition-transform duration-150 group-hover:translate-y-0.5 motion-reduce:transition-none" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.5v8" />
      <path d="m4.75 7.75 3.25 3.25 3.25-3.25" />
      <path d="M3 13.25h10" />
    </svg>
  );
}

// Note: Do NOT add `relative` to `btnBase` (Tailwind emits `.relative` after `.fixed` and overrides `fixed` on CV).
const btnBase =
  'group inline-flex min-h-12 cursor-pointer items-center justify-center text-label tracking-[0.18em] uppercase transition-transform duration-150 active:translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd27a] motion-reduce:transition-none';
const tabBtn =
  'pointer-events-auto relative z-10 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2 text-label font-semibold tracking-[0.16em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd27a]';

/** First main-lane beat where the CV tag shows (Experience). Before it the visitor is still arriving. */
const CV_FROM = 3;

export function Nav() {
  const t = useT();
  const { lang, toggle } = useLang();
  const lane = useLane();
  const [sound, setSound] = useState(false); // off by default; starts only on a click
  const audio = useRef<HTMLAudioElement>(null);
  const cvRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (!sound) return a.pause();
    // Wind outside the mountain (beats 0-1 and the projects lane), cavern hum inside.
    return subscribeFrame((f) => {
      const src = f.lane === 'main' && f.beat >= 2 ? '/audio/inside.mp3' : '/audio/outside.mp3';
      if (a.src.endsWith(src) && !a.paused) return;
      if (!a.src.endsWith(src)) a.src = src;
      a.play().catch(() => {});
    });
  }, [sound]);

  // CV tag: hidden through b2, shown from Experience on (and always in the projects lane). Attribute only
  // flips when the beat changes; CSS fades it (opacity/transform).
  useEffect(() => {
    let shown: boolean | undefined;
    return subscribeFrame((f) => {
      const on = f.lane === 'projects' || f.beat >= CV_FROM;
      if (on === shown || !cvRef.current) return;
      shown = on;
      cvRef.current.toggleAttribute('data-shown', on);
      cvRef.current.inert = !on;
    });
  }, []);

  const cv = profile.contact.cv;
  const inMain = lane === 'main';
  return (
    <>
      <nav data-chrome className="world-nav pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-end gap-2 p-2.5 sm:gap-3 sm:p-4">
        <a
          href="#content"
          className={`${btnBase} pointer-events-auto sr-only relative px-5 font-semibold text-[#1e1105] focus:not-sr-only`}
        >
          <PaperSheets theme="cream" w={200} seed={11} tilt="0deg" />
          <span className="relative z-10">{t(ui.nav.skip)}</span>
        </a>

        {cv && (
          <a
            ref={cvRef}
            href={cv}
            download="CV_Muhammad_Fatih_Zamzami.pdf"
            className={`${btnBase} chrome-cv pointer-events-auto relative mr-auto gap-2 pl-3 pr-4 font-semibold text-[#1e1105] sm:pl-3.5 sm:pr-5`}
          >
            <PaperSheets theme="cream" w={190} h={52} seed={71} tilt="-1.2deg" />
            <span className="relative z-10 flex items-center gap-2">
              {/* Cut-paper amber wax seal holding the download arrow */}
              <span className="relative flex size-6 shrink-0 items-center justify-center text-[#1e1105]">
                <svg aria-hidden viewBox="0 0 28 28" className="absolute inset-0 size-full overflow-visible">
                  <polygon points="14,1 22,4 27,12 24,21 15,27 6,24 1,15 4,6" fill="#a65b12" transform="translate(1, 1.5)" />
                  <polygon points="14,1 22,4 27,12 24,21 15,27 6,24 1,15 4,6" fill="#ffb44c" stroke="#fff1cc" strokeWidth="1" />
                </svg>
                <span className="relative z-10"><DownloadIcon /></span>
              </span>
              <span>{t(ui.contact.cvShort)}</span>
            </span>
          </a>
        )}

        <button
          type="button"
          className={`${btnBase} pointer-events-auto relative gap-2 px-4 font-semibold text-[#1e1105] sm:gap-2.5 sm:px-5`}
          onClick={() => (inMain ? enterLane('projects') : exitLane())}
        >
          {inMain ? (
            <>
              <PaperSheets theme="lantern" w={210} seed={23} hole={[17, 28, 3.2]} holeGlow="#fff9dc" tilt="-0.9deg" />
              <span className="relative z-10 flex items-center gap-2 pl-2.5 sm:gap-2.5">
                <DoorIcon />
                <span>{t(ui.nav.projects)}</span>
                <span aria-hidden className="lantern-pip size-1.5 rounded-full bg-[#7a380d]" />
              </span>
            </>
          ) : (
            <>
              <PaperSheets theme="cream" w={280} seed={29} hole={[16, 28, 3]} holeGlow="#221408" tilt="-0.6deg" />
              <span className="relative z-10 flex items-center gap-1.5 pl-2.5 sm:gap-2">
                <span aria-hidden>←</span>
                <MountainIcon />
                <span className="hidden sm:inline">{t(ui.nav.exitProjects)}</span>
                <span className="sm:hidden">{t(ui.nav.back)}</span>
              </span>
            </>
          )}
        </button>

        {/* Settings tab: one small paper sheet holding the language and sound toggles. */}
        <div role="group" aria-label={t(ui.nav.settings)} className="pointer-events-auto relative flex min-h-12 items-center gap-0.5 px-1.5 text-[#f3ead8]">
          <PaperSheets theme={sound ? 'nightLit' : 'night'} w={120} seed={41} tilt="0.8deg" />
          <button type="button" className={tabBtn} onClick={toggle} aria-label={t(ui.nav.language)} title={t(ui.nav.language)}>
            <span aria-hidden className={lang === 'en' ? 'text-[#ffe8b6]' : 'opacity-55'}>EN</span>
            <span aria-hidden className="opacity-40">/</span>
            <span aria-hidden className={lang === 'id' ? 'text-[#ffe8b6]' : 'opacity-55'}>ID</span>
          </button>
          <span aria-hidden className="relative z-10 h-5 w-px bg-current opacity-30" />
          <button
            type="button"
            className={`${tabBtn} ${sound ? 'text-[#ffe8b6]' : ''}`}
            aria-pressed={sound}
            aria-label={t(ui.nav.sound)}
            title={t(sound ? ui.nav.soundOn : ui.nav.soundOff)}
            onClick={() => setSound(!sound)}
          >
            <SoundIcon on={sound} />
          </button>
        </div>

        <audio ref={audio} loop preload="none" />
      </nav>
    </>
  );
}
