import { describe, expect, it } from "vitest";
import { timelinePos } from "./route";

describe("route timeline", () => {
  it("maps local stops onto the 10-stop night", () => {
    expect([0, 1, 2, 3].map((p) => timelinePos(p))).toEqual([2, 3, 7, 9]);
    expect(timelinePos(0.5)).toBe(2.5);
    expect(timelinePos(2.5)).toBe(8);
    expect([0, 4].map((p) => timelinePos(p, "channel"))).toEqual([2, 6]);
    expect(timelinePos(-1, "channel")).toBe(2);
  });
});
