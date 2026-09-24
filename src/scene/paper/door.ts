/**
 * The doorway in every room's back wall (Room.tsx), as plain numbers: shared with the phone wiring
 * (ui/Deck/wiring.ts), which must not pull three.js in. Local x (centred on the aisle), y up from the
 * floor: jambs up to `spring`, then a flattened arch whose apex lands on `top`.
 */
import { shell } from "@/design/tokens";

export function doorOutline(half: number = shell.doorHalf, spring: number = shell.doorTop - 6, top: number = shell.doorTop, n = 16): [number, number][] {
  const pts: [number, number][] = [
    [-half, 0],
    [-half, spring],
  ];
  const c = 2 * top - spring; // quadratic control so the apex lands on `top`
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([u * u * -half + t * t * half, u * u * spring + 2 * u * t * c + t * t * spring]);
  }
  pts.push([half, spring], [half, 0]);
  return pts;
}
