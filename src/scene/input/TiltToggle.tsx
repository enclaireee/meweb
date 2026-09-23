"use client";

import { useEffect, useState } from "react";
import { clamp } from "@/lib/math";
import { fast } from "@/scene/store";
import { wake } from "@/scene/loop";
import styles from "./TiltToggle.module.css";

type PermissionCapable = { requestPermission?: () => Promise<"granted" | "denied"> };

/**
 * "Tilt to look" (architecture.md §6.9): phones can look around the box by tilting, but iOS only
 * hands over orientation after a tap, so it's a paper toggle. Clamped to the pointer's ±3°/±2°;
 * the rig's damping is the low-pass filter.
 */
export function TiltToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      fast.tiltX = clamp((e.gamma ?? 0) / 25, -1, 1);
      fast.tiltY = clamp(((e.beta ?? 45) - 45) / 25, -1, 1);
      wake(300);
    };
    addEventListener("deviceorientation", onOrient);
    return () => {
      removeEventListener("deviceorientation", onOrient);
      fast.tiltX = 0;
      fast.tiltY = 0;
      wake(1500);
    };
  }, [on]);

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
