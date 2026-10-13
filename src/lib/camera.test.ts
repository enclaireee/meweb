import { describe, expect, it } from "vitest";
import { BASE_DOLLY, FLAT, camAt } from "./camera";

const P = [
  { yaw: -4, pitch: 0, lift: 0, dolly: 0 },
  { yaw: 6, pitch: 2, lift: -20, dolly: 60 },
];

describe("camAt", () => {
  it("hits each preset exactly at its stop (no swing at rest)", () => {
    expect(camAt(0, P)).toEqual({ ...P[0], dolly: BASE_DOLLY });
    expect(camAt(1, P).yaw).toBeCloseTo(6);
    expect(camAt(1, P).dolly).toBeCloseTo(BASE_DOLLY + 60);
  });
  it("pulls back mid-glide", () => {
    expect(camAt(0.5, P).dolly).toBeLessThan(BASE_DOLLY + 30);
  });
  it("is flat under reduced motion", () => {
    expect(camAt(0.5, P, { reduced: true })).toBe(FLAT);
  });
  it("halves angles on phones", () => {
    expect(camAt(1, P, { compact: true }).yaw).toBeCloseTo(3);
  });
  it("clamps past the ends", () => {
    expect(camAt(9, P).yaw).toBeCloseTo(6);
  });
});
