import { describe, expect, it } from "vitest";
import { arrived, easeGlide, hashFor, initial, jump, moveDuration, placeFromHash, step } from "./nav";
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
    expect(step(initial(3), 1).phase).toBe("rest");
  });

  it("jumps", () => {
    const s = jump(initial(0), 5);
    expect(s.to).toBe(3); // clamped to the main river
    expect(arrived(s)).toMatchObject({ stop: 3, phase: "rest" });
  });

  it("durations, hash and easing", () => {
    expect(moveDuration(1)).toBe(1200);
    expect(moveDuration(3)).toBe(1500);
    expect(moveDuration(7)).toBe(2100);
    expect(moveDuration(12)).toBe(2200);
    expect(placeFromHash("#stop-1")).toEqual({ route: "main", n: 1 });
    expect(placeFromHash("#stop-9")).toEqual({ route: "main", n: 3 });
    expect(placeFromHash("#made-1")).toEqual({ route: "channel", n: 0 });
    expect(placeFromHash("#made-9")).toEqual({ route: "channel", n: 4 });
    expect(placeFromHash("#about")).toBeNull();
    expect([hashFor("main", 2), hashFor("channel", 0)]).toEqual(["#stop-2", "#made-1"]);
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
