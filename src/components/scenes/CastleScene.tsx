"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, type RapierRigidBody } from "@react-three/rapier";
import Player from "../Player";
import CastleGround from "../CastleGround";
import PhotoFrame from "../PhotoFrame";
import CameraRig from "../CameraRig";
import HUD from "../ui/HUD";
import DPad from "../ui/DPad";
import SoundButton from "../ui/SoundButton";
import GalleryPopup from "../ui/GalleryPopup";
import PhotoHint from "../ui/PhotoHint";
import CastleExit from "../ui/CastleExit";
import { frames } from "@/data/gallery";

// ============================================================================
//  DALAM CASTLE: koridor batu (lantai + langit-langit), background hitam
//  temaram (vignette). Mario tetap jalan; deketin frame foto -> hint -> popup.
//  Scene ini cuma mount pas player masuk gerbang, jadi aset galeri baru
//  ke-load saat itu (lazy) -> overworld gak kebebanan.
// ============================================================================
export default function CastleScene() {
    const playerRef = useRef<RapierRigidBody | null>(null);

    return (
        <div
            className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#07060a]"
            // vignette gelap -> suasana lembap/temaram dalam castle
            style={{
                backgroundImage:
                    "radial-gradient(120% 90% at 50% 38%, #15121c 0%, #0a0810 55%, #050409 100%)",
            }}
        >
            <Canvas
                orthographic
                camera={{ position: [0, 3, 20], zoom: 62, near: 0.1, far: 1000 }}
                dpr={[1, 1.5]}
                gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
                style={{ background: "transparent" }}
            >
                <ambientLight intensity={1} />
                <Physics gravity={[0, -30, 0]}>
                    <CastleGround />
                    {/* spawn di x=4: tepat di kanan tembok kiri (tembok ada di x 0..2). */}
                    <Player playerRef={playerRef} spawnX={4} />
                    {frames.map((f) => (
                        <PhotoFrame key={f.photo.id} x={f.x} photo={f.photo} />
                    ))}
                    <CameraRig playerRef={playerRef} />
                </Physics>
            </Canvas>

            <HUD />
            <PhotoHint />
            <CastleExit />
            <GalleryPopup />
            <SoundButton />
            <DPad />
        </div>
    );
}