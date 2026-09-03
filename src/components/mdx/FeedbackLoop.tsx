"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The Refocus loop, playable: drag the attention signal; game difficulty
 * pursues it through a first-order control loop — the same shape the real
 * system runs from EEG. No-JS: renders statically at the setpoint (inert but
 * visible). Reduced motion: difficulty snaps instead of pursuing.
 */
export function FeedbackLoop() {
  const [attn, setAttn] = useState(62);
  const [diff, setDiff] = useState(62);
  const attnRef = useRef(62);

  useEffect(() => {
    // one loop for the component's lifetime; once converged the updater
    // returns the same value and React bails out, so idle frames are free
    const gain = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0.07; // ponytail: fixed pursuit gain; expose as prop if a second widget ever needs it
    let id: number;
    const step = () => {
      setDiff((d) => {
        const a = attnRef.current;
        const next = d + (a - d) * gain;
        return Math.abs(a - next) < 0.05 ? a : next;
      });
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, []);

  const err = attn - diff;
  const rows: [string, number, string][] = [
    ["Attention (low-β/θ)", attn, "bg-accent"],
    ["Game difficulty", diff, "bg-ink"],
  ];

  return (
    <div className="bg-raised">
      <div className="flex items-center justify-between border-b border-rule-faint px-5 py-2">
        <span className="meta text-faint">Try it</span>
        <span className="meta text-faint">
          error{" "}
          <span className={Math.abs(err) > 1 ? "text-accent" : "text-muted"}>
            {err > 0 ? "+" : ""}
            {err.toFixed(1)}
          </span>
        </span>
      </div>
      <div className="space-y-5 p-5">
        <label className="block">
          <span className="text-small text-muted">
            Drag the attention signal. Difficulty chases it, the same way it
            chases the real one off the headset.
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={attn}
            onChange={(e) => {
              attnRef.current = +e.target.value;
              setAttn(+e.target.value);
            }}
            className="mt-3 w-full accent-(--accent)"
            aria-label="Simulated attention signal"
          />
        </label>
        {rows.map(([label, v, color]) => (
          <div key={label}>
            <div className="flex justify-between">
              <span className="meta text-faint">{label}</span>
              <span className="text-small tabular-nums">{v.toFixed(0)}</span>
            </div>
            <div className="mt-2 h-1.5 bg-sunk">
              <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
