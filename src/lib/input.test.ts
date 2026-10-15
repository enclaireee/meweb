import { describe, expect, it } from "vitest";
import { createWheelGate, keyIntent, swipeStep } from "./input";

describe("wheel gate", () => {
  it("one trackpad gesture with inertia = one step", () => {
    const g = createWheelGate();
    const steps: number[] = [];
    let t = 0;
    // a flick: 12 events of 15, then a long inertia tail decaying over 1.5 s
    for (let i = 0; i < 12; i++) steps.push(g.feed(15, (t += 16)));
    g.moveStarted();
    for (let d = 14; d > 0.5; d *= 0.96) steps.push(g.feed(d, (t += 16)));
    g.moveEnded((t += 16));
    for (let d = 3; d > 0.5; d *= 0.9) steps.push(g.feed(d, (t += 16)));
    expect(steps.filter(Boolean)).toEqual([1]);
  });

  it("a new gesture after the move and a pause steps again", () => {
    const g = createWheelGate();
    expect(g.feed(100, 0)).toBe(1);
    g.moveStarted();
    g.moveEnded(1200);
    expect(g.feed(-100, 1950)).toBe(-1);
  });

  it("ignores input during the 700 ms after a move", () => {
    const g = createWheelGate();
    g.feed(100, 0);
    g.moveStarted();
    g.moveEnded(1200);
    expect(g.feed(100, 1500)).toBe(0);
  });
});

describe("swipe and keys", () => {
  it("swipe left = next, vertical ignored", () => {
    expect(swipeStep(-60, 5, 300)).toBe(1);
    expect(swipeStep(60, 5, 300)).toBe(-1);
    expect(swipeStep(-30, 5, 50)).toBe(1); // fast flick
    expect(swipeStep(-30, 5, 300)).toBe(0);
    expect(swipeStep(-60, 90, 300)).toBe(0);
  });

  it("keys", () => {
    expect(keyIntent({ key: "ArrowRight", shiftKey: false }, false)).toEqual({ step: 1 });
    expect(keyIntent({ key: " ", shiftKey: true }, false)).toEqual({ step: -1 });
    expect(keyIntent({ key: " ", shiftKey: false }, true)).toBeNull();
    expect(keyIntent({ key: "3", shiftKey: false }, false)).toEqual({ jump: 2 });
    expect(keyIntent({ key: "5", shiftKey: false }, false)).toBeNull();
    expect(keyIntent({ key: "End", shiftKey: false }, false)).toEqual({ jump: 3 });
  });
});
