"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { worker as W, ramp } from "@/design/tokens";
import { WorkerRig, applyPose, type Joints } from "@/scene/worker/rig";
import { pose, rest } from "@/scene/worker/walk";

/** Walk review (architecture.md §7.5): standing, slow and brisk, walking in place, side on. */
function Puppet({ x, gait }: { x: number; gait: "rest" | "slow" | "brisk" }) {
  const joints = useRef<Joints>(new Map());
  useFrame(({ clock }) => {
    const g = gait === "rest" ? null : W[gait];
    applyPose(joints.current, g ? pose(clock.elapsedTime / g.cycle, g) : rest);
  });
  return (
    <group position={[x, 0, 0]}>
      <WorkerRig joints={joints} />
    </group>
  );
}

export function WorkerPreview() {
  return (
    <div style={{ position: "fixed", inset: 0, background: ramp.night[1] }}>
      <Canvas flat shadows="percentage" camera={{ position: [0, 3, 15], fov: 32 }} onCreated={({ camera }) => camera.lookAt(0, 2.6, 0)}>
        <color attach="background" args={[ramp.night[1]]} />
        <hemisphereLight args={["#3A466B", "#0F1222", 1.6]} />
        <directionalLight position={[-4, 8, 6]} intensity={3.2} color="#FFD9A8" castShadow />
        <Puppet x={-3} gait="rest" />
        <Puppet x={0} gait="slow" />
        <Puppet x={3} gait="brisk" />
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[20, 10]} />
          <meshStandardMaterial color={ramp.night[5]} />
        </mesh>
      </Canvas>
    </div>
  );
}
