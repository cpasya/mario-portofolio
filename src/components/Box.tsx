"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CuboidCollider,
  type CollisionEnterPayload,
} from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore, type CardData } from "@/store/useGameStore";
import { drawBox, toTexture } from "@/lib/sprites";
import { playBump } from "@/lib/sound";

export default function Box({
  x,
  y = 3.2,
  card,
}: {
  x: number;
  y?: number;
  card: CardData;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bounce = useRef(0);
  const cooldown = useRef(0); // jeda singkat biar 1 sundulan = 1 koin
  const tex = useMemo(() => toTexture(drawBox(false)), []);

  // Sundul box: bisa berkali-kali (seterusnya), tiap sundul nambah koin + card.
  const onCollision = (e: CollisionEnterPayload) => {
    if (e.other.rigidBodyObject?.name !== "player") return;
    if (cooldown.current > 0) return;
    const py = e.other.rigidBody?.translation().y ?? 999;
    if (py >= y - 0.2) return; // pemain harus berada di bawah kotak
    const store = useGameStore.getState();
    store.addCoin();
    store.openCard(card);
    playBump();
    bounce.current = 1;
    cooldown.current = 0.6;
  };

  useFrame((_, dt) => {
    if (cooldown.current > 0) cooldown.current = Math.max(0, cooldown.current - dt);
    if (groupRef.current) {
      if (bounce.current > 0) {
        bounce.current = Math.max(0, bounce.current - dt * 4);
        groupRef.current.position.y = y + Math.sin(bounce.current * Math.PI) * 0.3;
      } else {
        groupRef.current.position.y = y;
      }
    }
  });

  return (
    <>
      <RigidBody type="fixed" position={[x, y, 0]} onCollisionEnter={onCollision}>
        <CuboidCollider args={[0.5, 0.5, 0.5]} />
      </RigidBody>
      <group ref={groupRef} position={[x, y, 0]}>
        <mesh>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={tex} transparent />
        </mesh>
      </group>
    </>
  );
}