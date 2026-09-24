import { describe, expect, it } from "vitest";
import { band } from "./wiring";

describe("the layered dolly", () => {
  it("rests every band at its baked size, fully shown", () => {
    for (let b = 0; b < 5; b++) expect(band(0, b)).toEqual({ z: 1, o: 1 });
  });

  it("keeps the room ahead smaller and hidden until the walk begins", () => {
    for (let b = 0; b < 5; b++) {
      expect(band(-1, b).z).toBeLessThan(1);
      expect(band(-1, b).o).toBe(0);
    }
  });

  it("passes the near sheets first, and the room itself stays until you're through", () => {
    // halfway through the walk the arch (B4) is behind the camera; the back wall (B1) still frames the doorway
    expect(band(0.5, 4).o).toBe(0);
    expect(band(0.5, 1).o).toBe(1);
    expect(band(0.5, 1).z).toBeGreaterThan(2);
    expect(band(0.99, 0).o).toBe(1);
  });

  it("swells nearer sheets faster", () => {
    expect(band(0.3, 4).z).toBeGreaterThan(band(0.3, 3).z);
    expect(band(0.3, 3).z).toBeGreaterThan(band(0.3, 1).z);
  });
});
