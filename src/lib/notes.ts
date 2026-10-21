// Which diegetic pieces a stop carries, in order. The sign always hangs with its plank below it (one cluster, Notes.tsx). Each takes the next of the stop's `spots` (site.ts).
import type { Stop } from "@/content/site";

export type PieceKind =
  | "lanterns" // stalls: a string of unlabelled paper lanterns; the sign's button is the way down
  | "sign" // hanging title sign
  | "crates" // pipeline: stencilled steps
  | "gauge" // spec: brass health gauge
  | "medal" // poster: awards medallion
  | "stub" // ticket: tied stub
  | "led" // datasheet: LED readout
  | "windows" // timeline: six lit windows
  | "pier"; // the lighthouse: the contact page as signs nailed along the pier

/** `phone`: one piece per stop, so the strip never covers the scene (the sign carries a short version of the rest). */
export function pieceKinds({ card }: Stop, phone = false): PieceKind[] {
  if (card.layout === "letter") return ["pier"];
  if (phone && card.layout !== "cv") return ["sign"];
  switch (card.layout) {
    case "cv":
      return []; // the landing draws itself (Landing.tsx)
    case "stalls":
      return ["sign", "lanterns"];
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
  }
}
