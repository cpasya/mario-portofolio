"use client";

import { useMemo } from "react";
import {
    RigidBody,
    CuboidCollider,
    type IntersectionEnterPayload,
    type IntersectionExitPayload,
} from "@react-three/rapier";
import { useGameStore } from "@/store/useGameStore";
import { drawCastle, toTexture } from "@/lib/sprites";

// ============================================================================
//  CASTLE ala Mario di ujung kanan dunia (x ~72..92).
//   - Murni VISUAL (di z negatif) -> berasa nempel di background.
//   - Gerbang di tengah digambar TERTUTUP (lihat drawCastle di sprites.ts).
//   - Ada zona sensor tak terlihat di depan gerbang: pas player berdiri di
//     situ -> set nearGate=true -> GatePopup nongol "under construction..".
//   - Belum bisa dimasukin beneran (gerbang ketutup), jadi sensor doang.
// ============================================================================

const CASTLE_X = 62; // titik tengah castle (rentang ~72..92)
const CASTLE_Y = 7; // pusat plane; dengan tinggi 16 -> dasar di y=-1 (nyentuh tanah)
const CASTLE_W = 20;
const CASTLE_H = 16;

export default function Castle() {
    const tex = useMemo(() => toTexture(drawCastle()), []);

    const onEnter = (e: IntersectionEnterPayload) => {
        if (e.other.rigidBodyObject?.name === "player")
            useGameStore.getState().setNearGate(true);
    };
    const onExit = (e: IntersectionExitPayload) => {
        if (e.other.rigidBodyObject?.name === "player")
            useGameStore.getState().setNearGate(false);
    };

    return (
        <>
            {/* Visual castle - di BELAKANG (z=-0.6) biar berasa background.
          Bagian dasar (y<0) ketutup strip tanah, jadi castle kayak "napak". */}
            <mesh position={[CASTLE_X, CASTLE_Y, -0.6]}>
                <planeGeometry args={[CASTLE_W, CASTLE_H]} />
                <meshBasicMaterial map={tex} transparent />
            </mesh>

            {/* Zona DEPAN GERBANG (sensor tak terlihat). Berdiri di sini -> popup. */}
            <RigidBody type="fixed" name="castle-gate" position={[CASTLE_X, 1.2, 0]}>
                <CuboidCollider
                    args={[1.8, 1.6, 1]}
                    sensor
                    onIntersectionEnter={onEnter}
                    onIntersectionExit={onExit}
                />
            </RigidBody>
        </>
    );
}