// Which diegetic pieces a stop carries, in order. The sign always hangs with its plank below it (one cluster, Notes.tsx). Each takes the next of the stop's `spots` (site.ts).
import type { Stop } from "@/content/site";

export type PieceKind =
  | "tickets" // stalls: one ticket per project, each walks into the market at its stall
  | "sign" // hanging title sign
  | "crates" // pipeline: stencilled steps
  | "gauge" // spec: brass health gauge
  | "medal" // poster: awards medallion
  | "stub" // ticket: tied stub
  | "led" // datasheet: LED readout
  | "windows" // timeline: six lit windows
  | "namecard"
  | "contact";

export function pieceKinds({ card }: Stop): PieceKind[] {
  switch (card.layout) {
    case "cv":
      return []; // the landing draws itself (Landing.tsx)
    case "stalls":
      return ["sign", "tickets"];
    case "pipeline":
      return ["sign", "crates"];
    case "spec":
      return ["sign", "gauge"];
    case "poster":
      return ["sign", "medal"];
    case "ticket":
      return ["sign", "stub"];
    case "datasheet":
      return ["sign", "led"];
    case "timeline":
      return ["sign", "windows"];
    case "letter":
      return ["namecard", "contact"];
  }
}
