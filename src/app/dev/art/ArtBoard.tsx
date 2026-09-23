"use client";

import { useEffect, useState } from "react";
import { stationArt, extraArt } from "@/scene/art";
import type { CutFile, CutPiece } from "@/scene/paper/cut";
import { stockColor, type LightMode, type Stock } from "@/design/tokens";
import { stations } from "@/sections/stations";

const toPath = (flat: number[]) => {
  let d = "";
  for (let i = 0; i < flat.length; i += 2) d += `${i ? "L" : "M"}${flat[i]} ${flat[i + 1]}`;
  return d + "Z";
};
const pieceD = (p: CutPiece) => toPath(p.outer) + p.holes.map(toPath).join("");

/**
 * The art review board (architecture.md §7.5): every cut file flat, with the checks that matter:
 * silhouette, squint, both lights, holes and the aisle.
 */
export function ArtBoard() {
  const [files, setFiles] = useState<(CutFile & { label: string })[]>([]);
  const [light, setLightMode] = useState<LightMode>("night");
  const [silhouette, setSilhouette] = useState(false);
  const [squint, setSquint] = useState(false);
  const [holes, setHoles] = useState(false);
  const [aisle, setAisle] = useState(true);

  useEffect(() => {
    Promise.all([
      ...stationArt.map((load, i) => load().then((f) => ({ ...f, label: `${String(i).padStart(2, "0")} ${stations[i]!.label}` }))),
      ...extraArt.map((a) => a.load().then((f) => ({ ...f, label: a.label }))),
    ]).then(setFiles);
  }, []);

  const toggle = (label: string, on: boolean, set: (v: boolean) => void) => (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} /> {label}
    </label>
  );

  return (
    <div className="min-h-screen bg-[#141726] p-8 text-[#e9dfcc]">
      <div className="mb-6 flex flex-wrap gap-6 text-caption">
        <strong className="text-kicker uppercase">Art board</strong>
        <label className="flex items-center gap-2">
          <select value={light} onChange={(e) => setLightMode(e.target.value as LightMode)} className="bg-transparent">
            <option value="night">night</option>
            <option value="morning">morning</option>
          </select>
        </label>
        {toggle("silhouette", silhouette, setSilhouette)}
        {toggle("squint", squint, setSquint)}
        {toggle("holes", holes, setHoles)}
        {toggle("aisle", aisle, setAisle)}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {files.map((f) => {
          const worker = f.label === "Worker";
          const vb = worker ? "-4 -0.5 8 7" : "-40 -2 80 48";
          const sheets = [...f.sheets].sort((a, b) => a.z - b.z);
          return (
            <figure key={f.label} data-art={f.name}>
              <figcaption className="text-kicker uppercase mb-2">
                {f.label} · {f.sheets.length} sheets
              </figcaption>
              <svg
                viewBox={vb}
                className="w-full rounded"
                style={{ background: stockColor("R0", light), filter: squint ? "blur(4px)" : undefined }}
              >
                <g transform={`scale(1 -1) translate(0 ${worker ? -6 : -44})`}>
                  {sheets.map((s) => (
                    <path
                      key={s.id}
                      d={s.pieces.map(pieceD).join("")}
                      fillRule="evenodd"
                      fill={silhouette ? "#000" : stockColor(s.stock as Stock, light)}
                      stroke={holes && s.pieces.some((p) => p.holes.length) ? "#ff3b3b" : "none"}
                      strokeWidth={0.12}
                    >
                      <title>{`${s.id} · ${s.stock} · z ${s.z}`}</title>
                    </path>
                  ))}
                  {aisle && !worker && (
                    <>
                      <rect x={-8} y={0} width={16} height={22} fill="none" stroke="#38e08b" strokeWidth={0.15} strokeDasharray="0.6 0.4" />
                      <line x1={-40} x2={40} y1={0} y2={0} stroke="#38e08b" strokeWidth={0.1} />
                    </>
                  )}
                </g>
              </svg>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
