"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Color, Plane, Vector3 } from "three";
import { box } from "@/design/tokens";
import { LAST_STATION } from "@/sections/stations";
import { fast } from "./store";
import { wake } from "./loop";

/** `?bake`: the scene renders the phone rooms as layered stills (scripts/rooms.mts, mobile_concept.md §4.2). */
export const baking = () => typeof location !== "undefined" && location.search.includes("bake");

/**
 * The five depth bands, as local z ranges [near, far] inside a station module (design.md §4.2).
 * B0 is not a slice: it's the whole box without this station's own sheets (the room's walls, floor
 * and ceiling, and everything through the doorway), so wherever the sheets in front part or pass, the
 * room itself is behind them. The rest are slices of the cards that face the camera only: the floor,
 * the ceiling and the side walls recede, so no single scale fits them (a strip of floor in a slice
 * drifts off its neighbours mid-walk and opens a gap); they live in B0 alone. The last room has
 * nothing behind it but sky, so its B1 runs to the end.
 */
function bands(station: number): [number, number][] {
  const back = station === LAST_STATION ? -Infinity : -47;
  return [
    [Infinity, -Infinity], // B0: the room and the view through its doorway
    [-36, back], // B1: far sheets and the back wall (the window room: its window and the city)
    [-23, -38], // B2: middle sheets and the hung things
    [-7, -25], // B3: the stage
    [Infinity, -9], // B4: the arch, the detail, the wings
  ];
}

const clear = new Color(0, 0, 0);

/**
 * `__bakeGo(station)` sends the camera to a room's rest; `__bake(station, band)` renders one band and
 * returns it as a PNG data URL. B0 keeps the scene's background; the other bands are transparent.
 */
export function BakeHook() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__bakeGo = (station: number) => {
      fast.s = station;
      wake(3000);
    };
    w.__bake = (station: number, band: number) => {
      const { gl, scene, camera } = get();
      const Z = -box.length * station;
      const [near, far] = bands(station)[band]!;
      const planes: Plane[] = [];
      // three keeps the side where normal · p + constant ≥ 0 (world space)
      if (near !== Infinity) planes.push(new Plane(new Vector3(0, 0, -1), Z + near));
      if (far !== -Infinity) planes.push(new Plane(new Vector3(0, 0, 1), -(Z + far)));
      const bg = scene.background;
      if (band > 0) scene.background = null;
      // B0 is the room without its own sheets; the slices are the facing cards without the receding shell
      const sheets: { visible: boolean }[] = [];
      scene.traverse((o) => (band === 0 ? o.userData.station === station : o.userData.recede) && sheets.push(o));
      sheets.forEach((o) => (o.visible = false));
      gl.setClearColor(clear, 0);
      gl.clippingPlanes = planes;
      gl.shadowMap.needsUpdate = true;
      gl.render(scene, camera);
      const url = gl.domElement.toDataURL("image/png");
      gl.clippingPlanes = [];
      sheets.forEach((o) => (o.visible = true));
      scene.background = bg;
      return url;
    };
    return () => {
      delete w.__bakeGo;
      delete w.__bake;
    };
  }, [get]);
  return null;
}
