"use client";

import { useEffect, useMemo, useState } from "react";
import {
    RigidBody,
    CuboidCollider,
    type IntersectionEnterPayload,
    type IntersectionExitPayload,
} from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore, type PhotoData } from "@/store/useGameStore";
import { drawFrame, toTexture } from "@/lib/sprites";

// ============================================================================
//  Satu FRAME foto di dinding castle.
//   - Bingkai emas dekoratif (sprite procedural) -> ringan.
//   - Foto asli ditampilkan di dalam bingkai TAPI cuma versi THUMBNAIL kecil
//     (THUMB_PX) -> keliatan tapi BLUR/soft, hemat GPU & gak bikin lag.
//   - PLACEHOLDER (🖼️ + judul) cuma muncul kalau foto BELUM ada; begitu
//     foto ke-load, bingkai ganti ke versi bersih (tanpa placeholder).
//   - Versi HD baru di-load pas dibuka di popup (GalleryPopup) -> tajam, dan
//     cuma 1 gambar HD dalam satu waktu.
//   - Sensor di ketinggian Mario: pas deket -> setNearPhoto -> muncul hint.
// ============================================================================

const FRAME_Y = 2.6; // ketinggian bingkai di dinding gelap
const FRAME_SIZE = 2.6; // ukuran visual bingkai (sama kaya sprite 256x256)
// Lubang "kanvas" gelap di drawFrame = (40..216)/256 = 0.6875 dari bingkai.
// Foto dibikin sedikit lebih kecil dari lubang biar tepi mat-nya keliatan.
const PHOTO_SIZE = FRAME_SIZE * (176 / 256) - 0.05; // ~1.74
const THUMB_PX = 48; // resolusi thumbnail di dinding (kecil -> blur + ringan)

export default function PhotoFrame({ x, photo }: { x: number; photo: PhotoData }) {
    // Dua varian bingkai: HINT (🖼️ + judul) pas foto belum ada, dan BERSIH
    // (cuma bingkai + mat gelap) pas foto udah ke-load.
    const frameTexHint = useMemo(() => toTexture(drawFrame(photo.title, true)), [photo.title]);
    const frameTexClean = useMemo(
        () => toTexture(drawFrame(photo.title, false)),
        [photo.title],
    );
    const [thumb, setThumb] = useState<THREE.Texture | null>(null);

    // Load gambar -> gambar ulang KECIL ke canvas square (contain) -> jadi
    // thumbnail blur pas di-upscale ke bingkai. Cuma sekali per src.
    useEffect(() => {
        if (!photo.src) return;
        let cancelled = false;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            if (cancelled) return;
            const S = THUMB_PX;
            const cnv = document.createElement("canvas");
            cnv.width = S;
            cnv.height = S;
            const ctx = cnv.getContext("2d");
            if (!ctx) return;
            // contain: jaga rasio, sisanya transparan (nembus ke mat gelap bingkai).
            const ratio = img.width / img.height || 1;
            let w = S;
            let h = S;
            if (ratio > 1) h = Math.round(S / ratio);
            else w = Math.round(S * ratio);
            ctx.clearRect(0, 0, S, S);
            ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);

            const tex = new THREE.CanvasTexture(cnv);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter; // di-upscale -> halus/blur
            tex.needsUpdate = true;
            setThumb(tex);
        };
        img.onerror = () => {
            /* biarin placeholder bingkai (🖼️ + judul) yang keliatan */
        };
        img.src = photo.src;
        return () => {
            cancelled = true;
        };
    }, [photo.src]);

    // Buang texture lama biar gak bocor memori.
    useEffect(() => {
        return () => {
            thumb?.dispose();
        };
    }, [thumb]);

    const onEnter = (e: IntersectionEnterPayload) => {
        if (e.other.rigidBodyObject?.name === "player")
            useGameStore.getState().setNearPhoto(photo);
    };
    const onExit = (e: IntersectionExitPayload) => {
        if (e.other.rigidBodyObject?.name === "player")
            useGameStore.getState().clearNearPhoto(photo.id);
    };

    return (
        <group>
            {/* Bingkai emas (visual) di dinding, z di belakang Mario (z=0).
          Pakai versi BERSIH (tanpa placeholder) begitu foto ke-load. */}
            <mesh position={[x, FRAME_Y, -0.4]}>
                <planeGeometry args={[FRAME_SIZE, FRAME_SIZE]} />
                <meshBasicMaterial map={thumb ? frameTexClean : frameTexHint} transparent />
            </mesh>

            {/* Foto thumbnail (blur) di dalam lubang bingkai, sedikit di DEPAN bingkai.
          Transparan biar area letterbox nembus ke mat gelap di belakang. */}
            {thumb && (
                <mesh position={[x, FRAME_Y, -0.39]}>
                    <planeGeometry args={[PHOTO_SIZE, PHOTO_SIZE]} />
                    <meshBasicMaterial map={thumb} transparent toneMapped={false} />
                </mesh>
            )}

            {/* Zona deket frame (sensor) di ketinggian Mario */}
            <RigidBody type="fixed" name="photo-zone" position={[x, 1.2, 0]}>
                <CuboidCollider
                    args={[1.3, 1.6, 1]}
                    sensor
                    onIntersectionEnter={onEnter}
                    onIntersectionExit={onExit}
                />
            </RigidBody>
        </group>
    );
}