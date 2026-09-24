/**
 * What he gets up to in each room while you read it: a different job per room. Each room has a few
 * jobs; every loop plays them in a new order, so he never runs the same script twice in a row.
 * Positions are station-local [x, z], in front of the props (they stand at z ≤ −14).
 */
import type { ActionName } from "./actions";

export type Step = { go: [number, number] } | { face: 1 | -1 } | { act: ActionName; for?: number } | { wait: number };
export type Job = Step[];

export const routines: Job[][] = [
  // 00 Desk: notes at the desk; a look at the notebook; a stretch by the lamp
  [
    [{ go: [-5.4, -11] }, { face: -1 }, { act: "write" }, { act: "scratch" }],
    [{ go: [5.6, -11.2] }, { face: 1 }, { act: "point" }, { act: "lookUp" }],
    [{ go: [-2, -9.5] }, { face: -1 }, { act: "stretch" }],
  ],
  // 01 Storeroom: heave a crate onto the pallet; count the racks
  [
    [{ go: [6.2, -11] }, { face: 1 }, { act: "lift" }, { act: "write" }],
    [{ go: [-6, -11.6] }, { face: -1 }, { act: "point" }, { act: "scratch" }],
    [{ go: [0.5, -10] }, { face: 1 }, { act: "write", for: 2.4 }],
  ],
  // 02 Control room: crank the valve; crouch at the gauge and log it
  [
    [{ go: [-6, -11.4] }, { face: -1 }, { act: "valve" }],
    [{ go: [6, -11.4] }, { face: 1 }, { act: "inspect" }, { act: "write" }],
  ],
  // 03 Arcade: a round on the machine, a victory hop and a dance; a look at the EEG head
  [
    [{ go: [6.4, -11.4] }, { face: 1 }, { act: "play" }, { act: "hop" }, { act: "dance" }],
    [{ go: [-6.2, -11.4] }, { face: -1 }, { act: "scratch" }, { act: "point" }],
  ],
  // 04 Drafting: draw at the board; step back and admire; note it down
  [
    [{ go: [-6.2, -11.4] }, { face: -1 }, { act: "draw" }, { act: "point" }],
    [{ go: [4, -11] }, { face: 1 }, { act: "write" }],
    [{ go: [-1, -9] }, { face: -1 }, { act: "lookUp" }],
  ],
  // 05 Sill: check the LED; wipe the solar panel; stretch in the (imagined) sun
  [
    [{ go: [6.2, -11.4] }, { face: 1 }, { act: "lookUp" }],
    [{ go: [-6.2, -11.4] }, { face: -1 }, { act: "wipe" }],
    [{ go: [0, -10] }, { face: 1 }, { act: "stretch" }],
  ],
  // 06 Wall: fetch a tool from the pegboard; pin a card on the cork
  [
    [{ go: [-6.2, -11.4] }, { face: -1 }, { act: "reach" }, { act: "pin" }],
    [{ go: [6.2, -11.4] }, { face: 1 }, { act: "pin" }, { act: "lookUp" }],
  ],
  // 07 Bedroom: sit on the edge of the bed and stretch; round the bed to the window for the moon; wave goodnight
  [
    [{ go: [-8.5, -11.4] }, { face: 1 }, { act: "sit" }, { act: "yawn" }],
    [{ go: [13, -12] }, { go: [12, -36] }, { face: -1 }, { act: "lookUp", for: 3.5 }, { go: [13, -12] }],
    [{ go: [6, -11] }, { face: -1 }, { act: "wave" }],
  ],
];
