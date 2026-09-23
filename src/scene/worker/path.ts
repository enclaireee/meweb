/**
 * The floor cable (portfolio_concept.md §3): plugged in at the desk, zigzagging across the aisle
 * through every station, ending at the socket under the window. The worker walks it. The zigzag keeps
 * his heading within ±55° of lateral so a flat puppet never goes edge-on (design.md §8).
 */
import { CatmullRomCurve3, Vector3 } from "three";
import { box, worker } from "@/design/tokens";

/** the plug on the desk's right, and the socket under the window sill (world units) */
export const PLUG = new Vector3(9.4, 0, -12.5);
export const SOCKET = new Vector3(9.6, 0, box.windowWallZ + 4);

const HALF = 5;
const maxLeg = 2 * HALF * Math.tan((worker.yawClampDeg * Math.PI) / 180); // Δz per leg at the clamp

function cablePoints(): Vector3[] {
  const pts = [PLUG.clone(), new Vector3(HALF, 0, PLUG.z - 4)];
  const legZ = Math.min(12, maxLeg * 0.9);
  let x = -HALF;
  for (let z = PLUG.z - 4 - legZ; z > SOCKET.z + legZ; z -= legZ) {
    pts.push(new Vector3(x, 0, z));
    x = -x;
  }
  pts.push(new Vector3(HALF * Math.sign(SOCKET.x), 0, SOCKET.z + 3), SOCKET.clone());
  return pts;
}

export const cable = new CatmullRomCurve3(cablePoints(), false, "centripetal");
export const cableLength = cable.getLength();

/** Arc length (0..1) where the worker waits at each station: the aisle just behind the arch. */
export function restU(station: number): number {
  const z = -box.length * station - 14;
  // cable z decreases monotonically: binary search the arc parameter for that z
  let lo = 0;
  let hi = 1;
  const p = new Vector3();
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    cable.getPointAt(mid, p);
    if (p.z > z) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
