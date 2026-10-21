import { describe, expect, it } from "vitest";
import { stops } from "@/content/site";
import { pieceKinds } from "./notes";

describe("pieces", () => {
  it("every stop has a spot for each piece, and at most 3 pieces", () => {
    for (const s of stops) {
      const n = pieceKinds(s).length;
      expect(s.spots.length, `stop ${s.i}`).toBeGreaterThanOrEqual(n);
      expect(n, `stop ${s.i}`).toBeLessThanOrEqual(3);
    }
  });

  it("phones get one piece per stop", () => {
    for (const s of stops) expect(pieceKinds(s, true).length, `stop ${s.i}`).toBeLessThanOrEqual(1);
    expect(pieceKinds(stops[3]!, true)).toEqual(["pier"]);
  });
});
