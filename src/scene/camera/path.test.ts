import { describe, expect, it } from "vitest";
import { stationCoord, cameraZ } from "./path";

describe("scroll → camera", () => {
  it("hits every rest exactly and holds it through the dwell", () => {
    for (let i = 0; i <= 7; i++) for (const p of [0.3, 0.45, 0.5, 0.7]) expect(stationCoord(i, p)).toBe(i);
  });

  it("is continuous across section boundaries", () => {
    for (let i = 0; i < 7; i++) expect(stationCoord(i, 1)).toBeCloseTo(stationCoord(i + 1, 0), 10);
  });

  it("is monotonic along the whole route and clamped at both ends", () => {
    let prev = -Infinity;
    for (let i = 0; i <= 7; i++)
      for (let k = 0; k <= 100; k++) {
        const s = stationCoord(i, k / 100);
        expect(s).toBeGreaterThanOrEqual(prev - 1e-12);
        prev = s;
      }
    expect(stationCoord(0, 0)).toBe(0);
    expect(stationCoord(7, 1)).toBe(7);
  });

  it("puts the camera restDistance in front of each arch", () => {
    expect(cameraZ(0)).toBe(35);
    expect(cameraZ(2)).toBe(-125);
  });
});
