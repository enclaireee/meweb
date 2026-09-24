"use client";

import { useEffect, useState } from "react";
import { clamp } from "@/lib/math";
import styles from "./TiltToggle.module.css";

type PermissionCapable = { requestPermission?: () => Promise<"granted" | "denied"> };

/**
 * "Tilt to look" (architecture.md §6.9): phones can look around the box by tilting, but iOS only
 * hands over orientation after a tap, so it's a paper toggle. `onTilt` gets −1..1 on each axis (the
 * scene's rig or the phone stage smooths it) and (0, 0) when it's switched off.
 */
export function TiltToggle({ onTilt }: { onTilt: (x: number, y: number) => void }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      onTilt(clamp((e.gamma ?? 0) / 25, -1, 1), clamp(((e.beta ?? 45) - 45) / 25, -1, 1));
    };
    addEventListener("deviceorientation", onOrient);
    return () => {
      removeEventListener("deviceorientation", onOrient);
      onTilt(0, 0);
    };
  }, [on, onTilt]);

  const toggle = async () => {
    if (on) return setOn(false);
    const D = (globalThis as { DeviceOrientationEvent?: PermissionCapable }).DeviceOrientationEvent;
    if (!D) return;
    if (D.requestPermission) {
      try {
        if ((await D.requestPermission()) !== "granted") return;
      } catch {
        return;
      }
    }
    setOn(true);
  };

  return (
    <button type="button" className={`cast ${styles.toggle}`} aria-pressed={on} onClick={toggle}>
      <span className={`${styles.face} paper grain text-caption italic`}>{on ? "Tilting" : "Tilt to look"}</span>
    </button>
  );
}
