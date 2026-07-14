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
  const raf = useRef(0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDiff(attn);
      return;
    }
    const step = () => {
      setDiff((d) => {
        const next = d + (attn - d) * 0.07; // ponytail: fixed pursuit gain; expose as prop if a second widget ever needs it
        return Math.abs(attn - next) < 0.05 ? attn : next;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [attn]);

  const err = attn - diff;
  const rows: [string, number, string][] = [
    ["SIG/ATTENTION (LOW-β/θ)", attn, "bg-accent"],
    ["CTL/DIFFICULTY", diff, "bg-ok"],
  ];

  return (
    <div className="border border-border bg-bg-subtle">
      <div className="flex items-center justify-between border-b border-border px-s3 py-s1">
        <span className="label text-fg-muted">DEMO/CLOSED-LOOP</span>
        <span className="label text-fg-muted">
          ERR — <span className={Math.abs(err) > 1 ? "text-accent" : "text-ok"}>
            {err > 0 ? "+" : ""}{err.toFixed(1)}
          </span>
        </span>
      </div>
      <div className="space-y-s3 p-s3">
        <label className="block">
          <span className="label text-fg-muted">DRAG THE SIGNAL — THE LOOP PURSUES IT</span>
          <input
            type="range"
            min={0}
            max={100}
            value={attn}
            onChange={(e) => setAttn(+e.target.value)}
            className="mt-s2 w-full accent-(--accent)"
            aria-label="Simulated attention signal"
          />
        </label>
        {rows.map(([label, v, color]) => (
          <div key={label}>
            <div className="flex justify-between">
              <span className="label text-fg-muted">{label}</span>
              <span className="font-mono text-body-s tabular-nums">{v.toFixed(0)}</span>
            </div>
            <div className="mt-s1 h-s1 border border-border-faint">
              <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
