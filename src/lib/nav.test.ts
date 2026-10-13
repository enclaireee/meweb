import { describe, expect, it } from "vitest";
import { arrived, closeCard, easeGlide, initial, jump, moveDuration, openCard, step, stopFromHash } from "./nav";
import { computeLayout, landmarkX, screenX } from "./layout";

describe("nav", () => {
  it("steps, clamps and queues one step", () => {
    let s = step(initial(0), -1);
    expect(s.phase).toBe("rest");
    s = step(s, 1);
    expect(s).toMatchObject({ stop: 0, to: 1, phase: "moving" });
    s = step(step(s, 1), 1); // two inputs while moving: one queued
    expect(s.queued).toBe(1);
    s = arrived(s);
    expect(s).toMatchObject({ stop: 1, to: 2, phase: "moving", queued: 0 });
    s = arrived(s);
    expect(s).toMatchObject({ stop: 2, phase: "rest" });
    expect(step(initial(7), 1).phase).toBe("rest");
  });

  it("jumps and locks while the card is open", () => {
    let s = jump(initial(0), 5);
    expect(s.to).toBe(5);
    s = arrived(s);
    s = openCard(s);
    expect(step(s, 1)).toBe(s);
    expect(jump(s, 0)).toBe(s);
    expect(closeCard(s).phase).toBe("rest");
    expect(openCard(jump(s, 1))).toBe(s); // jump ignored in card
  });

  it("durations, hash and easing", () => {
    expect(moveDuration(1)).toBe(1200);
    expect(moveDuration(3)).toBe(1500);
    expect(moveDuration(7)).toBe(2100);
    expect(moveDuration(12)).toBe(2200);
    expect(stopFromHash("#stop-3")).toBe(3);
    expect(stopFromHash("#stop-9")).toBe(7);
    expect(stopFromHash("#about")).toBeNull();
    expect(easeGlide(0)).toBe(0);
    expect(easeGlide(1)).toBe(1);
    expect(easeGlide(0.5)).toBeGreaterThan(0.5);
  });
});

describe("layout", () => {
  it("k, anchor and rest-fan", () => {
    const d = computeLayout(1440, 900);
    expect(d.frame).toBe(54);
    expect(d.k).toBeCloseTo(Math.max(792 / 1000, 1332 / 1900));
    expect(d.anchor).toBeCloseTo(0.3 * 1332);
    const p = computeLayout(390, 844);
    expect(p.profile).toBe("phone");
    expect(p.anchor).toBeCloseTo(0.34 * 344);
    expect(landmarkX(1, 3)).toBe(1200 + 3 * 1700 + 260);
    // at rest the landmark of stop i on layer s sits 260·s·k ahead of the anchor
    for (const s of [0.14, 0.5, 1, 2]) expect(screenX(d, s, landmarkX(s, 4), 4)).toBeCloseTo(d.anchor + 260 * s * d.k);
  });
});
