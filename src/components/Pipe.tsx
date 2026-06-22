"use client";

import { useMemo } from "react";
import {
  RigidBody,
  CuboidCollider,
  type IntersectionEnterPayload,
  type IntersectionExitPayload,
} from "@react-three/rapier";
import { useGameStore, type CardData } from "@/store/useGameStore";
import { drawPipe, toTexture } from "@/lib/sprites";

export default function Pipe({ x, card }: { x: number; card: CardData }) {
  const tex = useMemo(() => toTexture(drawPipe()), []);

  const onEnter = (e: IntersectionEnterPayload) => {
    if (e.other.rigidBodyObject?.name === "player")
      useGameStore.getState().setNearPipe(card);
  };
  const onExit = (e: IntersectionExitPayload) => {
    if (e.other.rigidBodyObject?.name === "player")
      useGameStore.getState().clearNearPipe(card.id);
  };

  return (
    <>
      {/* Badan pipa (solid) */}
      <RigidBody type="fixed" position={[x, 0.9, 0]}>
        <CuboidCollider args={[0.8, 0.9, 0.8]} />
      </RigidBody>
      {/* Zona checkpoint tak terlihat (sensor) */}
      <RigidBody type="fixed" name="checkpoint" position={[x, 1.6, 0]}>
        <CuboidCollider
          args={[1.4, 1.2, 1]}
          sensor
          onIntersectionEnter={onEnter}
          onIntersectionExit={onExit}
        />
      </RigidBody>
      {/* Visual pipa digeser ke DEPAN (z=0.3) dari player (z=0), jadi pas player
          naik ke atas pipa, kaki/tungkai bawahnya ketutup dikit sama bibir pipa.
          Aman: badan pipa solid, jadi player ga pernah jalan nembus di bawahnya. */}
      <mesh position={[x, 0.9, 0.3]}>
        <planeGeometry args={[2, 2.4]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
    </>
  );
}