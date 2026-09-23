import { describe, expect, it } from "vitest";
import { parseSvg } from "./parse.mts";
import { cutFile } from "./emit.mts";
import { SCENE } from "./wobble.mts";

const svg = (paths: string, attrs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 0 64 40" ${attrs}>${paths}</svg>`;

const good = svg(`
  <path id="crate" d="M-24 30 H-12 V40 H-24 Z" data-z="-20" data-stock="R5" data-holes="M-20 32 H-16 V34 H-20 Z" />
  <path id="crate-lid" d="M-24.5 29 H-11.5 V31 H-24.5 Z" data-z="-20" data-stock="R6" />
`);

const area = (flat: number[]) => {
  let a = 0;
  for (let i = 0; i < flat.length; i += 2) {
    const j = (i + 2) % flat.length;
    a += flat[i]! * flat[j + 1]! - flat[j]! * flat[i + 1]!;
  }
  return a / 2;
};

describe("cut pipeline", () => {
  it("is deterministic: same input, byte-identical output", () => {
    const a = JSON.stringify(cutFile(parseSvg("t.svg", good), "t", SCENE).out);
    const b = JSON.stringify(cutFile(parseSvg("t.svg", good), "t", SCENE).out);
    expect(a).toBe(b);
  });

  it("passes a clean sheet, flips y up, keeps the hole and stacks same-z sheets", () => {
    const { out, errors } = cutFile(parseSvg("t.svg", good), "t", SCENE);
    expect(errors).toEqual([]);
    const [crate, lid] = out.sheets;
    expect(crate!.bbox[1]).toBeGreaterThan(-0.5); // SVG y=40 is the floor → world y≈0
    expect(crate!.bbox[3]).toBeLessThan(10.5);
    expect(crate!.pieces[0]!.holes).toHaveLength(1);
    expect(lid!.z).toBe(-19.75); // second sheet at z=-20 sits one stack step in front
  });

  it("normalises winding: outer counter-clockwise, holes clockwise (y up)", () => {
    const { out } = cutFile(parseSvg("t.svg", good), "t", SCENE);
    const piece = out.sheets[0]!.pieces[0]!;
    expect(area(piece.outer)).toBeGreaterThan(0);
    expect(area(piece.holes[0]!)).toBeLessThan(0);
  });

  it("fails paper that would tear, float or block the aisle", () => {
    const bad = svg(`
      <path id="thin" d="M-30 10 H-12 V10.1 H-30 Z M-30 12 H-12 V20 H-30 Z" data-z="-20" data-stock="R4" />
      <path id="island" d="M-30 25 H-15 V39 H-30 Z M-25 30 H-20 V34 H-25 Z" data-holes="M-28 27 H-17 V37 H-28 Z" data-z="-20" data-stock="R4" />
      <path id="blocker" d="M-4 30 H4 V40 H-4 Z" data-z="-30" data-stock="R3" />
      <path id="Bad_Id" d="M20 0 H22 V2 H20 Z" data-z="-30" data-stock="blue" stroke="red" />
    `);
    const { errors } = cutFile(parseSvg("t.svg", bad), "t", SCENE);
    const all = errors.join("\n");
    expect(all).toMatch(/#thin: has a strip thinner/);
    expect(all).toMatch(/floating island/);
    expect(all).toMatch(/#blocker: blocks the aisle/);
    expect(all).toMatch(/kebab-case/);
    expect(all).toMatch(/"stroke" is forbidden/);
    expect(all).toMatch(/not a stock/);
  });
});
