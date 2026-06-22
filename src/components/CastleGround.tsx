"use client";

import { useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";
import { drawStone, toTexture } from "@/lib/sprites";

// ============================================================================
//  KORIDOR CASTLE: lantai (bawah) + langit-langit (atas) + TEMBOK kiri & kanan,
//  semua dari blok batu.
//   - Lantai sengaja dibikin TEBAL turun jauh ke bawah biar ga keliatan
//     "melayang" (ga ada celah gelap di bawah lantai kayak bug ground overworld).
//   - Tembok kiri/kanan sekarang KEliatan + solid, setinggi ruangan.
//  Ubah angka di bawah buat atur panjang & tinggi koridor.
// ============================================================================

const FLOOR_TOP = 0; // permukaan lantai (Mario berdiri di sini, sama kaya overworld)
const START_X = 0; // ujung kiri koridor
const WIDTH = 56; // panjang koridor (sumbu X)
const END_X = START_X + WIDTH;
const CENTER_X = (START_X + END_X) / 2;
const CEIL_Y = 8; // sisi bawah langit-langit (tinggi ruang)

// Visual dibikin tebal -> turun jauh ke bawah & naik ke atas, nutup layar penuh
// jadi ga ada void gelap yang bikin lantai keliatan ngambang.
const FLOOR_DEPTH = 30; // tebal visual lantai (ke bawah dari FLOOR_TOP)
const CEIL_DEPTH = 8; // tebal visual langit-langit (ke atas dari CEIL_Y)
const FLOOR_COLLIDER_HALF_H = 2; // setengah tinggi collider lantai (fisik)

// Tembok kiri & kanan (solid + visible).
const WALL_HALF_W = 1; // setengah lebar tembok
const WALL_LEFT_X = START_X + WALL_HALF_W; // pusat tembok kiri (x 0..2)
const WALL_RIGHT_X = END_X - WALL_HALF_W; // pusat tembok kanan (x 54..56)
const WALL_H = CEIL_Y - FLOOR_TOP; // tinggi tembok (lantai -> langit-langit)
const WALL_CENTER_Y = FLOOR_TOP + WALL_H / 2;

// Texture batu tileable; atur jumlah ulangan (1 tile ~ 4 unit dunia) biar
// tile-nya ga ketarik/molor.
function stoneTexture(repeatX: number, repeatY: number) {
    const t = toTexture(drawStone());
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
    return t;
}

export default function CastleGround() {
    const floorTex = useMemo(() => stoneTexture(WIDTH / 4, FLOOR_DEPTH / 4), []);
    const ceilTex = useMemo(() => stoneTexture(WIDTH / 4, CEIL_DEPTH / 4), []);
    const wallTex = useMemo(
        () => stoneTexture((WALL_HALF_W * 2) / 4, WALL_H / 4),
        [],
    );

    return (
        <>
            {/* ===== FISIK ===== */}
            <RigidBody type="fixed" friction={1}>
                {/* lantai solid (permukaan di y = FLOOR_TOP) */}
                <CuboidCollider
                    args={[WIDTH / 2, FLOOR_COLLIDER_HALF_H, 5]}
                    position={[CENTER_X, FLOOR_TOP - FLOOR_COLLIDER_HALF_H, 0]}
                />
                {/* langit-langit (biar Mario ga lompat keluar ruang) */}
                <CuboidCollider args={[WIDTH / 2, 0.5, 5]} position={[CENTER_X, CEIL_Y + 0.5, 0]} />
                {/* tembok KIRI & KANAN (solid, setinggi ruangan) */}
                <CuboidCollider
                    args={[WALL_HALF_W, WALL_H / 2, 5]}
                    position={[WALL_LEFT_X, WALL_CENTER_Y, 0]}
                />
                <CuboidCollider
                    args={[WALL_HALF_W, WALL_H / 2, 5]}
                    position={[WALL_RIGHT_X, WALL_CENTER_Y, 0]}
                />
            </RigidBody>

            {/* ===== VISUAL lantai batu (tebal ke bawah -> ga ngambang) ===== */}
            <mesh position={[CENTER_X, FLOOR_TOP - FLOOR_DEPTH / 2, -0.5]}>
                <planeGeometry args={[WIDTH, FLOOR_DEPTH]} />
                <meshBasicMaterial map={floorTex} />
            </mesh>

            {/* ===== VISUAL langit-langit batu ===== */}
            <mesh position={[CENTER_X, CEIL_Y + CEIL_DEPTH / 2, -0.5]}>
                <planeGeometry args={[WIDTH, CEIL_DEPTH]} />
                <meshBasicMaterial map={ceilTex} />
            </mesh>

            {/* ===== VISUAL tembok kiri & kanan (di depan lantai dikit, di belakang Mario) ===== */}
            <mesh position={[WALL_LEFT_X, WALL_CENTER_Y, -0.4]}>
                <planeGeometry args={[WALL_HALF_W * 2, WALL_H]} />
                <meshBasicMaterial map={wallTex} />
            </mesh>
            <mesh position={[WALL_RIGHT_X, WALL_CENTER_Y, -0.4]}>
                <planeGeometry args={[WALL_HALF_W * 2, WALL_H]} />
                <meshBasicMaterial map={wallTex} />
            </mesh>
        </>
    );
}