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
});
