/**
 * The phone wiring (mobile_concept.md §4), loaded only on phones (ui/Deck/Deck.tsx). The page scrolls
 * natively and snaps at each room; this turns the scroll into a walk through the rooms' baked bands
 * (the layered dolly), keeps the front room's card up, tells the story, and eases the tilt. Nothing
 * runs per frame unless the page is scrolling or the tilt is settling.
 */
import type { LightMode } from "@/design/tokens";
import { box } from "@/design/tokens";
import { stations } from "@/sections/stations";
import { store } from "@/scene/store";
import { pick } from "@/scene/worker/speech";
import * as lines from "@/scene/worker/lines";

// the desktop lines talk about cursors, clicks and scrolling: not on a phone
const fits = (list: readonly string[]) => list.filter((l) => !/cursor|click|scroll/i.test(l));
const hello = fits(lines.hello);
const rooms = lines.rooms.map(fits);
const tap = fits(lines.hover);

/**
 * How far each band stands from the camera at a room's rest (world units, design.md §4.2: the camera
 * is 35 in front of the arch): B0 the room itself and the view through its doorway (scaled as the
 * far view), B1 the back wall, B2 the middle and hung sheets, B3 the stage, B4 the arch. The walk from one rest to the next is `box.length`.
 */
const DEPTH = [120, 78, 67, 50, 36];
/** a sheet fades as it reaches the camera: from this far off (world units) to gone at the next */
const PASS_FROM = 14;
const PASS_BY = 4;
/** the next room fades in over the first part of the walk, over this room's own view through its doorway */
const HANDOFF = 0.3;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * One band of room r with the camera at coordinate s: its scale about the vanishing point and its
 * opacity. Ahead of the camera (d < 0) a room is further off by the walk still to go, so it's smaller;
 * behind it (d > 0) the camera has walked into it, so its sheets swell and, one by one, pass.
 * (A flat sheet at distance D seen from Δ closer is D / (D − Δ) times the size.)
 */
export function band(d: number, b: number): { z: number; o: number } {
  const D = DEPTH[b]!;
  const left = D - box.length * d;
  const z = left > 0 ? D / left : Infinity;
  if (d <= 0) return { z, o: clamp01((1 + d) / HANDOFF) };
  // the room itself stays until you're through: the room ahead is stacked over it (ui/StationShell)
  if (b === 0) return { z, o: 1 };
  // (by distance, not size: the back wall has to frame the doorway until you're through it)
  return { z, o: clamp01((left - PASS_BY) / (PASS_FROM - PASS_BY)) };
}

export type DeckApi = { stop: () => void; tilt: (x: number, y: number) => void; poke: () => void };

export function startDeck(): DeckApi {
  const html = document.documentElement;
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[data-station]"));
  const bands = sections.map((s) => Array.from(s.querySelectorAll<HTMLElement>(":scope > div:first-child > div")));
  const teller = document.querySelector<HTMLElement>("[data-teller]");
  const bubble = document.querySelector<HTMLElement>("[data-bubble]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  html.dataset.deck = "";

  // --- the storyteller's bubble: up for as long as it takes to read ----------------------------
  let hide = 0;
  const say = (text: string | undefined) => {
    if (!bubble || !text) return;
    bubble.textContent = text;
    delete bubble.dataset.show;
    void bubble.offsetWidth; // restart the pop-in
    bubble.dataset.show = "";
    clearTimeout(hide);
    hide = window.setTimeout(() => delete bubble.dataset.show, Math.min(7000, 1900 + text.length * 55));
  };
  const cue = (name: "turn" | "poke") => {
    if (!teller) return;
    delete teller.dataset.cue;
    void teller.offsetWidth;
    teller.dataset.cue = name;
  };
  const flag = (el: HTMLElement, name: string, on: boolean) => {
    if (on === name in el.dataset) return;
    if (on) el.dataset[name] = "";
    else delete el.dataset[name];
  };

  // --- tilt to look: eased toward the phone's angle, written onto the front room ---------------
  const aim = { x: 0, y: 0 };
  const look = { x: 0, y: 0 };
  let tiltRaf = 0;
  const settle = () => {
    cancelAnimationFrame(tiltRaf);
    const step = () => {
      const room = sections[current];
      const nx = Math.abs(aim.x - look.x) < 0.005 || Number.isNaN(look.x) ? aim.x : look.x + (aim.x - look.x) * 0.12;
      const ny = Math.abs(aim.y - look.y) < 0.005 || Number.isNaN(look.y) ? aim.y : look.y + (aim.y - look.y) * 0.12;
      look.x = nx;
      look.y = ny;
      room?.style.setProperty("--look-x", nx.toFixed(3));
      room?.style.setProperty("--look-y", ny.toFixed(3));
      if (nx !== aim.x || ny !== aim.y) tiltRaf = requestAnimationFrame(step);
    };
    tiltRaf = requestAnimationFrame(step);
  };

  // --- the walk: scroll → camera coordinate → every nearby band's scale and opacity -------------
  let current = -1;
  let told = -1;
  const coord = () => {
    const len = sections[1]!.offsetTop - sections[0]!.offsetTop;
    return Math.min(Math.max(scrollY / len, 0), sections.length - 1);
  };
  const walk = (s: number) => {
    sections.forEach((sec, r) => {
      const d = s - r;
      // displayed a room either side (so its bands are fetched before the walk reaches it)
      flag(sec, "near", Math.abs(d) < 1.6);
      flag(sec, "moving", Math.abs(d) > 1e-3 && Math.abs(d) < 1);
      if (Math.abs(d) >= 1.6) return;
      bands[r]!.forEach((el, b) => {
        // out of reach (a jump can skip straight past): hidden. Reduced motion: no swelling past the
        // camera, the rooms cross-fade at the midpoint instead
        const { z, o } = Math.abs(d) >= 1 ? { z: 1, o: 0 } : reduced.matches ? { z: 1, o: Math.abs(d) < 0.5 ? 1 : 0 } : band(d, b);
        el.style.setProperty("--z", Number.isFinite(z) ? z.toFixed(4) : "1");
        el.style.opacity = o.toFixed(3);
      });
    });
  };
  const land = (i: number) => {
    if (i === current) return;
    const first = current < 0;
    sections[current]?.style.removeProperty("--look-x");
    sections[current]?.style.removeProperty("--look-y");
    current = i;
    sections.forEach((sec, k) => flag(sec, "active", k === i));
    store.setState({ station: i });
    // the address follows the room, so it can be shared (a load keeps whatever link it came in on)
    if (!first) history.replaceState(null, "", `#${stations[i]!.slug}`);
    look.x = look.y = NaN; // re-apply the tilt to the new room
    settle();
  };

  let raf = 0;
  let still = 0;
  const frame = () => {
    raf = 0;
    const s = coord();
    walk(s);
    land(Math.round(s));
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(frame);
    // a new room gets its line once the walk has stopped (not for every room walked through)
    clearTimeout(still);
    still = window.setTimeout(() => {
      if (current === told) return;
      told = current;
      cue("turn");
      say(pick(rooms[current]!));
    }, 300);
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  frame();
  told = current;
  const greet = window.setTimeout(() => say(pick(current === 0 ? hello : rooms[current]!)), 900);

  // keyboard and screen readers can reach every room's card: focusing one walks there
  const onFocus = (e: FocusEvent) => {
    const sec = (e.target as HTMLElement).closest<HTMLElement>("main > section[data-station]");
    if (sec && !("active" in sec.dataset)) scrollTo({ top: sec.offsetTop, behavior: "instant" });
  };
  document.addEventListener("focusin", onFocus);

  // the relight gets a word too
  const unsub = store.subscribe((s, prev) => s.light !== prev.light && say(pick(lines.light[s.light as LightMode])));

  return {
    stop() {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      document.removeEventListener("focusin", onFocus);
      unsub();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(tiltRaf);
      [hide, still, greet].forEach(clearTimeout);
      delete html.dataset.deck;
    },
    tilt(x, y) {
      aim.x = x;
      aim.y = y;
      settle();
    },
    poke() {
      cue("poke");
      say(pick(tap));
    },
  };
}
