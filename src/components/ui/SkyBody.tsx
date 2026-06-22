"use client";

import { useGameStore } from "@/store/useGameStore";

// ============================================================================
//  Matahari / Bulan di pojok kiri atas (dekorasi langit).
//   - morning -> matahari (kuning, glow, denyut pelan)
//   - night   -> bulan (sabit, pakai inset-shadow warna langit malam)
//   - rain    -> disembunyikan (ketutup awan mendung)
//  Ukuran responsif: kecil di HP, sedikit lebih besar di layar >= sm.
//  Posisinya agak di bawah HUD koin biar gak tabrakan.
// ============================================================================

const CSS = `
.sky-sun {
  border-radius: 9999px;
  background: radial-gradient(circle at 50% 45%, #fff6b0 0%, #ffd64d 55%, #ffb01f 100%);
  box-shadow: 0 0 18px 6px rgba(255,210,80,.7), 0 0 42px 14px rgba(255,190,40,.32);
  animation: skySunPulse 4s ease-in-out infinite;
}
@keyframes skySunPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }

.sky-moon {
  border-radius: 9999px;
  background: radial-gradient(circle at 50% 50%, #f4f7ff 0%, #cdd6ea 70%, #aab4ce 100%);
  box-shadow: inset -9px -5px 0 0 rgba(16,24,46,.95), 0 0 16px 5px rgba(200,215,255,.4);
}
`;

export default function SkyBody() {
    const weather = useGameStore((s) => s.weather);
    if (weather === "rain") return null;

    const isNight = weather === "night";
    return (
        <div className="pointer-events-none absolute left-4 top-16 z-10 sm:left-6 sm:top-20">
            <style>{CSS}</style>
            <div
                className={`${isNight ? "sky-moon" : "sky-sun"} h-12 w-12 sm:h-20 sm:w-20`}
            />
        </div>
    );
}