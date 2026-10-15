// The two rivers share one night: each route's stops map onto the original 9-stop timeline (dusk at the Spring,
// deep night down the projects cascade, dawn at the Village). Sky and layer fx are written against that timeline.

export type Route = "main" | "channel";

/** Original timeline index of each local stop. */
export const TIMELINE: Record<Route, readonly number[]> = { main: [2, 3, 7, 9], channel: [2, 3, 4, 5, 6] };

/** Local fractional stop → fractional position on the original 9-stop timeline. */
export function timelinePos(pos: number, route: Route = "main"): number {
  const T = TIMELINE[route];
  const i = Math.max(0, Math.min(T.length - 2, Math.floor(pos)));
  const t = Math.max(0, Math.min(1, pos - i));
  return T[i]! + (T[i + 1]! - T[i]!) * t;
}
