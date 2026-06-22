"use client";

import { useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import { drawGround, drawGrass, drawChasm, toTexture } from "@/lib/sprites";

// ============================================================================
//  PENGATURAN GROUND — ubah angka di bawah sesuai kebutuhan.
// ============================================================================

/** Posisi permukaan atas tanah (tempat karakter berdiri). Biarkan di 0. */
const SURFACE_Y = 0;

/** Lebar total tanah pada sumbu X. */
const WIDTH = 90;

/** Titik tengah tanah pada sumbu X (world ada di x -15..105 -> tengah 45).
 *  Diperlebar ke kanan biar tanahnya nyampe castle di x ~72..92. */
const CENTER_X = 35;

/** Tebal RUMPUT tipis di permukaan (cuma garis hijau, jangan kegedean). */
const GRASS_H = 1;

/**
 * >>> TEBAL BATA (permukaan orange-kuning) KE BAWAH <<<
 * INI yang lo cari: naikin buat manjangin bata ke sumbu Y bawah.
 * (Beda sama GROUND_DEPTH yang ngatur kedalaman JURANG gelap di belakang.)
 */
const BRICK_DEPTH = 8;

/**
 * >>> KETEBALAN TANAH KE BAWAH <<<
 * Ini "isian" tanah polos yang memanjang ke bawah, biar di layar laptop
 * (yang tinggi) tanah-nya nggak keliatan "terbang" / ada langit di bawahnya.
 * NAIKKAN angka ini kalau masih keliatan ngambang di layar lu.
 */
const GROUND_DEPTH = 150;

// Warna "JURANG" sekarang pakai GRADASI (amber #c8761a -> nyaris hitam) lewat
// drawChasm() di sprites.ts, jadi gak pakai warna solid lagi.
// Mau ubah gradasinya? Edit addColorStop di drawChasm().

/**
 * Setengah-tinggi collider FISIK (tabrakan). Permukaan tetap di y = SURFACE_Y.
 * Bikin lebih tebal kalau khawatir karakter nembus tanah saat jatuh cepat.
 */
const COLLIDER_HALF_H = 2;

export default function Ground() {
  // Tekstur rumput tipis (diulang horizontal).
  const grassTex = useMemo(() => {
    const t = toTexture(drawGrass());
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(WIDTH / 2, 1);
    return t;
  }, []);

  // Tekstur bata permukaan: gradasi orange->kuning (diulang horizontal, stretch vertikal).
  const brickTex = useMemo(() => {
    const t = toTexture(drawGround());
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(WIDTH / 2, 1);
    return t;
  }, []);

  // Tekstur jurang: gradasi orange muda -> hitam (dominan gelap) ke bawah.
  const chasmTex = useMemo(() => toTexture(drawChasm()), []);

  return (
    <>
      {/* --- FISIK: lantai solid, permukaan tepat di y = SURFACE_Y --- */}
      <RigidBody type="fixed" friction={1}>
        <CuboidCollider
          args={[WIDTH / 2, COLLIDER_HALF_H, 5]}
          position={[CENTER_X, SURFACE_Y - COLLIDER_HALF_H, 0]}
        />
      </RigidBody>

      {/* --- VISUAL 1: JURANG gelap di belakang ---
          Mulai dari BAWAH bata (bukan dari permukaan), biar gradasi orange-muda
          -> hitam-nya nyambung halus tepat di bawah bata. z paling belakang. */}
      <mesh
        position={[
          CENTER_X,
          SURFACE_Y - GRASS_H - BRICK_DEPTH - GROUND_DEPTH / 2,
          -0.7,
        ]}
      >
        <planeGeometry args={[WIDTH * 2, GROUND_DEPTH]} />
        <meshBasicMaterial map={chasmTex} />
      </mesh>

      {/* --- VISUAL 2: BATA permukaan (TEBAL, diatur lewat BRICK_DEPTH) ---
          Persis di bawah rumput; gradasi orange->kuning dari atas ke bawah. */}
      <mesh position={[CENTER_X, SURFACE_Y - GRASS_H - BRICK_DEPTH / 2, -0.5]}>
        <planeGeometry args={[WIDTH, BRICK_DEPTH]} />
        <meshBasicMaterial map={brickTex} transparent />
      </mesh>

      {/* --- VISUAL 3: RUMPUT tipis di permukaan (paling depan) --- */}
      <mesh position={[CENTER_X, SURFACE_Y - GRASS_H / 2, -0.49]}>
        <planeGeometry args={[WIDTH, GRASS_H]} />
        <meshBasicMaterial map={grassTex} transparent />
      </mesh>
    </>
  );
}