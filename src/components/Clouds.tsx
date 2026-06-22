"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { drawCloud, toTexture } from "@/lib/sprites";
import { useGameStore } from "@/store/useGameStore";

// ============================================================================
//  Awan PARALLAX — anti-lag & gak "nempel" ke kamera:
//   - 1 tekstur canvas di-share ke semua awan (drawCloud sekali).
//   - Animasi di useFrame dgn MUTASI posisi langsung (tanpa re-render React).
//   - PARALLAX: awan hidup di world-space, tapi di layar cuma geser sebesar
//     PARALLAX (mis. 30%) dari gerak kamera (kesan kedalaman, bukan nempel).
//   - Di-wrap dalam SPAN supaya langit selalu keisi walau Mario jalan jauh.
//   - Posisi Y mengambang naik-turun pelan (sin), tiap awan beda fase.
//   - WARNA awan ngikut cuaca: siang putih, malam/hujan jadi abu gelap
//     (material.color dikali ke tekstur putih).
// ============================================================================

// off = jarak antar awan (unit dunia), y = ketinggian dasar, s = skala,
// amp = besar ayunan naik-turun, phase = beda fase, vsp = kecepatan ayun
const CLOUDS = [
  { off: 0, y: 6.0, s: 1.0, amp: 0.35, phase: 0.0, vsp: 0.7 },
  { off: 9, y: 7.5, s: 1.3, amp: 0.28, phase: 1.7, vsp: 0.55 },
  { off: 18, y: 6.5, s: 0.9, amp: 0.4, phase: 3.0, vsp: 0.8 },
  { off: 27, y: 7.2, s: 1.15, amp: 0.3, phase: 4.4, vsp: 0.5 },
  { off: 36, y: 6.2, s: 1.0, amp: 0.38, phase: 5.6, vsp: 0.65 },
  { off: 45, y: 7.6, s: 0.8, amp: 0.26, phase: 2.3, vsp: 0.75 },
];

const SPAN = 54; // lebar area wrap (unit dunia) — lebih lebar dari layar
const SPEED = 0.28; // drift ambient (gerak walau Mario diam), unit/detik
const PARALLAX = 0.3; // 0 = diam di dunia, 1 = nempel ke kamera. 0.3 = pelan

// Tint awan per cuaca (dikalikan ke tekstur putih).
const TINT: Record<string, string> = {
  morning: "#ffffff",
  night: "#566073",
  rain: "#7b8493",
};

export default function Clouds() {
  const tex = useMemo(() => toTexture(drawCloud()), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const drift = useRef(0); // drift ambient horizontal
  const elapsed = useRef(0); // waktu utk ayunan vertikal
  const { camera } = useThree();
  const weather = useGameStore((s) => s.weather);
  const tint = TINT[weather];

  useFrame((_, dt) => {
    // clamp dt: kalau tab sempat gak aktif, dt bisa gede -> cegah "loncat".
    const d = Math.min(dt, 0.05);
    drift.current += d * SPEED;
    elapsed.current += d;
    const t = elapsed.current;
    const camX = camera.position.x;

    for (let i = 0; i < CLOUDS.length; i++) {
      const m = refs.current[i];
      if (!m) continue;
      const c = CLOUDS[i];
      // X: relatif-layar = base - drift - (kamera * PARALLAX), lalu wrap.
      let rel = (c.off - drift.current - camX * PARALLAX) % SPAN;
      if (rel < 0) rel += SPAN;
      m.position.x = camX + rel - SPAN / 2;
      // Y: mengambang naik-turun pelan (sin), tiap awan beda fase.
      m.position.y = c.y + Math.sin(t * c.vsp + c.phase) * c.amp;
    }
  });

  return (
    <>
      {CLOUDS.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[c.off, c.y, -3]}
          scale={[c.s, c.s, 1]}
        >
          <planeGeometry args={[3, 1.7]} />
          <meshBasicMaterial map={tex} color={tint} transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}