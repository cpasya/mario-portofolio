"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";

// Kamera ortografik mengikuti karakter di sumbu X secara mulus (lerp).
export default function CameraRig({
  playerRef,
}: {
  playerRef: React.MutableRefObject<RapierRigidBody | null>;
}) {
  const target = useRef(new THREE.Vector3(0, 3, 0));
  const snapped = useRef(false);
  useFrame((state) => {
    const rb = playerRef.current;
    if (!rb) return;
    const p = rb.translation();
    const x = Math.max(0, p.x); // jangan scroll ke kiri melewati start
    // Frame pertama: langsung patok kamera ke posisi player (hindari pan dari 0
    // pas spawn di depan gerbang sehabis keluar castle).
    if (!snapped.current) {
      state.camera.position.x = x;
      snapped.current = true;
    }
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 3, 0.05);
    target.current.set(state.camera.position.x, 3, 0);
    state.camera.lookAt(target.current);
  });
  return null;
}