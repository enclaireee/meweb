import { describe, expect, it } from "vitest";
import { stepSpring, springActive, type Spring } from "./spring";

describe("string spring", () => {
  it("swings a few times, then settles within ~3 s", () => {
    const s: Spring = { x: 0, v: 3 };
    let crossings = 0;
    let prev = s.x;
    for (let t = 0; t < 3; t += 1 / 60) {
      stepSpring(s, 0, 1 / 60);
      if (Math.sign(s.x) !== Math.sign(prev) && prev !== 0) crossings++;
      prev = s.x;
    }
    expect(crossings).toBeGreaterThanOrEqual(3);
    expect(Math.abs(s.x)).toBeLessThan(0.01);
  });

  it("stays finite after a huge delta (tab was asleep)", () => {
    const s: Spring = { x: 1, v: 10 };
    stepSpring(s, 0, 60);
    expect(Number.isFinite(s.x) && Number.isFinite(s.v)).toBe(true);
    for (let i = 0; i < 600; i++) stepSpring(s, 0, 1 / 60);
    expect(springActive(s, 0)).toBe(false);
  });
});
