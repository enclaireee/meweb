import s from "./Reeds.module.css";

export type ReedState = "open" | "narrow" | "closed";

/** Paper reed curtains in screen space, outside the camera layers: "narrow" frames the side channel, "closed" hides a jump. */
export function Reeds({ state }: { state: ReedState }) {
  return (
    <div className={s.reeds} data-state={state} aria-hidden="true">
      <div className={s.left} />
      <div className={s.right} />
    </div>
  );
}
