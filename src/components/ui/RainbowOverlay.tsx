"use client";

import { useGameStore } from "@/store/useGameStore";

// ============================================================================
//  PELANGI SAMAR - cuma muncul pas cuaca "morning".
//   - Busur melingkar gede yang "napak" dari ground naik ke langit.
//   - Dibuat dari radial-gradient (cincin warna) + blur + opacity rendah
//     biar samar/aesthetic, ga norak.
//   - Dirender DI BELAKANG canvas (lihat Game.tsx) -> otomatis di balik awan.
//   - Bagian bawah lingkaran ketutup tanah yang opaque, jadi keliatan kayak
//     muncul dari permukaan.
// ============================================================================

// Ukuran diameter lingkaran. Gede dikit biar busurnya lebar & megah.
// Pakai vmax biar tetap proporsional di layar lebar maupun tinggi.
const RB_SIZE = "120vmax";

const CSS = `
.rainbow-layer { animation: rainbowIn 1.8s ease-out both; }
@keyframes rainbowIn { from { opacity: 0 } to { opacity: 1 } }

.rainbow-arc {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: ${RB_SIZE};
  height: ${RB_SIZE};
  transform: translate(-50%, 50%); /* titik tengah lingkaran nempel di garis bawah */
  border-radius: 50%;
  opacity: 0.26;            /* samar */
  filter: blur(3px) saturate(1.05);
  /* Cincin warna. Dari ATAS busur (sisi dalam) turun ke bawah (sisi luar):
     merah -> orange -> kuning -> hijau -> ungu. Ungu di paling bawah +
     fade transparan biar nge-blend halus sama gradasi langit. */
  background: radial-gradient(circle at 50% 50%,
    transparent 0 59%,
    rgba(150, 70, 220, 0.50) 60%,
    rgba(74, 200, 120, 0.55) 64%,
    rgba(240, 225, 92, 0.74) 68%,
    rgba(255, 94, 0, 0.89) 72%,
    rgba(250, 21, 0, 0.9) 77%,   /* ungu (bawah, nge-blend) */
    transparent 80%);
}
`;

export default function RainbowOverlay() {
    const weather = useGameStore((s) => s.weather);
    if (weather !== "morning") return null;

    return (
        <div className="rainbow-layer pointer-events-none absolute inset-0 overflow-hidden">
            <style>{CSS}</style>
            <div className="rainbow-arc" />
        </div>
    );
}