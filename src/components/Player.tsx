"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CapsuleCollider,
  CuboidCollider,
  type RapierRigidBody,
  type IntersectionEnterPayload,
  type IntersectionExitPayload,
} from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { drawPlayer, toTexture } from "@/lib/sprites";
import { playJump, playFall } from "@/lib/sound";

const SPEED = 6;
const JUMP = 13;
const START_POS: [number, number, number] = [0, 2, 0];
const FALL_LIMIT = -8; // jatuh di bawah ini => respawn
const RESPAWN_Y = 14; // muncul lagi tinggi di langit, lalu jatuh
const FOOT_DROP = 0.12; // turunin sprite dikit biar kaki napak tanah (ga ngambang)

export default function Player({
  playerRef,
  spawnX = 0,
}: {
  playerRef: React.MutableRefObject<RapierRigidBody | null>;
  /** Posisi X awal Player (overworld pakai posisi balik dari castle; default 0). */
  spawnX?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const groundContacts = useRef(0);
  const wasJump = useRef(false);
  const facing = useRef(1);
  const animTime = useRef(0);
  const spin = useRef(0);
  const idleTime = useRef(0); // buat gestur "nafas" pas diem

  const frames = useMemo(
    () => [toTexture(drawPlayer(0)), toTexture(drawPlayer(1)), toTexture(drawPlayer(2))],
    [],
  );

  // Deteksi menapak tanah via foot-sensor (anti perbedaan versi Rapier).
  const isRealGround = (e: IntersectionEnterPayload | IntersectionExitPayload) => {
    if (e.other.rigidBodyObject?.name === "checkpoint") return false;
    if (e.other.collider?.isSensor?.()) return false;
    return true;
  };
  const onFootEnter = (e: IntersectionEnterPayload) => {
    if (isRealGround(e)) groundContacts.current += 1;
  };
  const onFootExit = (e: IntersectionExitPayload) => {
    if (isRealGround(e)) groundContacts.current = Math.max(0, groundContacts.current - 1);
  };

  const respawn = (rb: RapierRigidBody) => {
    playFall();
    useGameStore.getState().resetCoins(); // jatuh ke jurang -> koin balik ke 0
    rb.setTranslation({ x: START_POS[0], y: RESPAWN_Y, z: 0 }, true);
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
    groundContacts.current = 0;
    facing.current = 1;
  };

  useFrame((_, dt) => {
    const rb = playerRef.current;
    if (!rb) return;
    const pos = rb.translation();

    // Jatuh ke jurang -> respawn dari langit.
    if (pos.y < FALL_LIMIT) {
      respawn(rb);
      return;
    }

    const { controls, activeCard, activePhoto, started } = useGameStore.getState();
    const v = rb.linvel();
    const grounded = groundContacts.current > 0;
    const canMove = started && !activeCard && !activePhoto;

    let dir = 0;
    let jumpPressed = false;
    if (canMove) {
      if (controls.left) dir -= 1;
      if (controls.right) dir += 1;
      jumpPressed = controls.jump;
    }

    const moveX = dir * SPEED;
    let vy = v.y;
    if (canMove && jumpPressed && !wasJump.current && grounded) {
      vy = JUMP;
      playJump();
    }
    wasJump.current = canMove ? jumpPressed : false;
    rb.setLinvel({ x: moveX, y: vy, z: 0 }, true);
    if (pos.z !== 0) rb.setTranslation({ x: pos.x, y: pos.y, z: 0 }, true);

    // Arah hadap + animasi sprite.
    if (dir !== 0) facing.current = dir > 0 ? 1 : -1;
    let frame = 0;
    if (!grounded) {
      frame = 1;
    } else if (Math.abs(moveX) > 0.1) {
      animTime.current += dt;
      frame = 1 + (Math.floor(animTime.current * 9) % 2);
    } else {
      animTime.current = 0;
      frame = 0;
    }
    if (matRef.current && matRef.current.map !== frames[frame]) {
      matRef.current.map = frames[frame];
      matRef.current.needsUpdate = true;
    }

    // Efek "jatuh dari langit": muter pelan kalau lagi meluncur jatuh dari tinggi.
    const falling = !grounded && v.y < -6 && pos.y > 4;
    if (falling) spin.current += dt * 6;
    else spin.current *= 0.8;
    // Gestur "nafas" pas DIEM (napak tanah & ga gerak): badan naik-turun +
    // dada kembang-kempis halus. Pas jalan/lompat/jatuh, efek ini mati.
    const idle = grounded && Math.abs(moveX) <= 0.1 && !falling;
    if (idle) idleTime.current += dt;
    else idleTime.current = 0;
    const breath = idle ? Math.sin(idleTime.current * 2.6) : 0; // -1..1, ~2.4s/siklus

    if (meshRef.current) {
      // "Nafas" dengan KAKI tetap napak tanah: sprite di-scale dari sisi BAWAH.
      // Pas tinggi (scale.y) nambah, position.y dinaikin separuh selisihnya, jadi
      // tepi bawah (kaki) selalu diam di posisi yang sama -> cuma dada/kepala naik-turun.
      const sy = 1.7 + breath * 0.06; // tinggi sprite (kembang-kempis dada)
      meshRef.current.scale.x = facing.current * 1.3;
      meshRef.current.scale.y = sy;
      // (sy-1.7)/2 = kompensasi nafas (kaki diam). -FOOT_DROP = turunin biar napak.
      meshRef.current.position.y = (sy - 1.7) / 2 - FOOT_DROP;
      meshRef.current.rotation.z = Math.sin(spin.current) * (falling ? 0.4 : 0) * facing.current;
    }
  });

  return (
    <RigidBody
      ref={playerRef}
      name="player"
      position={[spawnX, START_POS[1], START_POS[2]]}
      colliders={false}
      lockRotations
      enabledTranslations={[true, true, false]}
      friction={0}
    >
      <CapsuleCollider args={[0.4, 0.4]} />
      {/* Sensor kaki: ngitung kontak tanah buat izin lompat */}
      <CuboidCollider
        args={[0.3, 0.12, 0.3]}
        position={[0, -0.85, 0]}
        sensor
        onIntersectionEnter={onFootEnter}
        onIntersectionExit={onFootExit}
      />
      <mesh ref={meshRef} scale={[1.3, 1.7, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={matRef}
          map={frames[0]}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </RigidBody>
  );
}