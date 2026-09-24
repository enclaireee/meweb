import { store } from "@/scene/store";
/**
 * The worker's speech bubble (lines.ts). One bubble, module state: `say` shows a line over his head for
 * as long as it takes to read, then folds it away. Lines are drawn from a shuffled deck per list, so
 * nothing repeats until the list has run out.
 */
const decks = new Map<readonly string[], string[]>();

/** The next line from `list`, never the same one twice in a row. */
export function pick(list: readonly string[]): string {
  let deck = decks.get(list);
  if (!deck?.length) {
    deck = [...list].sort(() => Math.random() - 0.5);
    decks.set(list, deck);
  }
  return deck.pop()!;
}

let el: HTMLElement | null = null;
let hideTimer = 0;
let until = 0;
let rank = 0;

export function bindBubble(node: HTMLElement | null) {
  el = node;
}

/** Is he mid-sentence? */
export const saying = () => performance.now() < until;

/**
 * Say a line. `priority` 0 is chatter (never interrupts), 1 is a reply to you (hover, click) and cuts
 * chatter off; a line never interrupts a higher one.
 */
export function say(text: string, priority = 0) {
  // he only talks once he's on stage: not from behind the poster while the box is still being built
  if (!el || !store.getState().sceneLive) return false;
  if (saying() && (priority < rank || (priority === 0 && rank === 0))) return false;
  const ms = Math.min(7000, 1900 + text.length * 55);
  rank = priority;
  until = performance.now() + ms;
  el.textContent = text;
  delete el.dataset.show;
  // restart the pop-in
  void el.offsetWidth;
  el.dataset.show = "";
  clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    if (el) delete el.dataset.show;
    rank = 0;
  }, ms);
  return true;
}
