import { describe, expect, it } from "vitest";
import { worker } from "@/design/tokens";
import { LEG, cycleDistance, pose } from "./walk";

describe("walk cycle", () => {
  it("is periodic", () => {
    for (const g of [worker.slow, worker.brisk]) {
      const a = pose(0.137, g);
      const b = pose(1.137, g);
      for (const k of Object.keys(a) as (keyof typeof a)[]) expect(b[k]).toBeCloseTo(a[k], 10);
    }
  });

  it("plants the stance foot: it slides less than 0.05 while the body walks over it", () => {
    for (const g of [worker.slow, worker.brisk]) {
      const speedPerPhase = cycleDistance(g); // body travel per unit of phase
      // the front leg is planted for phase ½ → 1
      const xs: number[] = [];
      for (let p = 0.5; p <= 1.0001; p += 0.01) {
        const body = p * speedPerPhase;
        xs.push(body + LEG * Math.sin(pose(p, g).hipFront));
      }
      expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(0.05);
    }
  });

  it("only bends a knee while its leg swings through", () => {
    const g = worker.slow;
    for (let p = 0.5; p < 1; p += 0.05) expect(pose(p, g).kneeFront).toBe(0);
    expect(pose(0.25, g).kneeFront).toBeLessThan(0);
  });

  it("bobs about as much as design.md says (0.12 slow, 0.14 brisk)", () => {
    for (const [g, bob] of [
      [worker.slow, 0.12],
      [worker.brisk, 0.14],
    ] as const) {
      let lo = Infinity;
      let hi = -Infinity;
      for (let p = 0; p < 1; p += 0.005) {
        const y = pose(p, g).hipY;
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
      expect(hi - lo).toBeGreaterThan(bob * 0.8);
      expect(hi - lo).toBeLessThan(bob * 1.8);
    }
  });
});
