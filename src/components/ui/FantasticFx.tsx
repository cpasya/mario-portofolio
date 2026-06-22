"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

// ============================================================================
//  Efek "FANTASTIC": dipicu pas koin = 29 (lihat store.addCoin).
//   - Kilat menyambar dari langit ke tengah layar (posisi Mario, karena kamera
//     selalu ngikutin Mario di tengah).
//   - Flash putih berkedip.
//   - Tulisan "FANTASTIC" tebal & 3D: muncul (scale + fade in) lalu memudar.
//  Semua pakai CSS animation murni biar instan, mulus, dan gak kena setting
//  Reduce Motion-nya OS.
// ============================================================================

const DURATION = 2200; // total durasi efek (ms) — samain dgn keyframe di bawah

const CSS = `
/* flash putih kilat (berkedip 2x lalu hilang) */
.fx-flash { animation: fxFlash 2.2s ease-out both; }
@keyframes fxFlash {
  0%   { opacity: 0 }
  5%   { opacity: .85 }
  10%  { opacity: .12 }
  15%  { opacity: .8 }
  26%  { opacity: 0 }
  100% { opacity: 0 }
}

/* sambaran petir: tumbuh dari atas ke bawah + flicker */
.fx-bolt {
  transform-origin: top center;
  filter: drop-shadow(0 0 10px #fff7a0) drop-shadow(0 0 26px #ffd000);
  animation: fxBolt 2.2s ease-out both;
}
@keyframes fxBolt {
  0%   { opacity: 0; transform: translateX(-50%) scaleY(.15) }
  5%   { opacity: 1; transform: translateX(-50%) scaleY(1) }
  11%  { opacity: .25 }
  17%  { opacity: 1 }
  27%  { opacity: 1 }
  36%  { opacity: 0 }
  100% { opacity: 0; transform: translateX(-50%) scaleY(1) }
}

/* tulisan FANTASTIC: pop-in 3D lalu memudar naik */
.fx-text {
  font-family: "Arial Black", system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.5rem, 12vw, 8.5rem);
  letter-spacing: .05em;
  line-height: 1;
  color: #ffd83d;
  -webkit-text-stroke: 2px #6f5500;
  text-shadow:
    0 1px 0 #d4a900, 0 2px 0 #c79e00, 0 3px 0 #b99200,
    0 4px 0 #ab8700, 0 5px 0 #9d7b00, 0 6px 0 #8f7000,
    0 8px 12px rgba(0,0,0,.5), 0 0 26px rgba(255,222,90,.65);
  animation: fxText 2.2s cubic-bezier(.2,.85,.25,1) both;
}
@keyframes fxText {
  0%   { opacity: 0; transform: translateY(26px) scale(.5) rotate(-5deg) }
  16%  { opacity: 1; transform: translateY(0) scale(1.12) rotate(0deg) }
  26%  { transform: translateY(0) scale(1) }
  68%  { opacity: 1; transform: translateY(0) scale(1) }
  100% { opacity: 0; transform: translateY(-28px) scale(1.03) }
}
`;

export default function FantasticFx() {
    const fantasticKey = useGameStore((s) => s.fantasticKey);
    const clearFantastic = useGameStore((s) => s.clearFantastic);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!fantasticKey) return;
        setShow(true);
        const t = setTimeout(() => {
            setShow(false);
            clearFantastic();
        }, DURATION);
        return () => clearTimeout(t);
    }, [fantasticKey, clearFantastic]);

    if (!show) return null;

    return (
        // key={fantasticKey} -> tiap trigger bikin elemen baru => animasi restart
        <div
            key={fantasticKey}
            className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
        >
            <style>{CSS}</style>

            {/* flash kilat layar penuh */}
            <div className="fx-flash absolute inset-0 bg-white" />

            {/* petir nyamber dari atas ke arah Mario (tengah layar) */}
            <div className="fx-bolt absolute left-1/2 top-0 h-[60%] w-24">
                <svg
                    viewBox="0 0 60 200"
                    preserveAspectRatio="none"
                    className="h-full w-full"
                >
                    <polygon
                        points="36,0 15,94 30,94 18,200 52,82 34,82 47,6"
                        fill="#fff7b0"
                        stroke="#ffd000"
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* tulisan FANTASTIC di langit */}
            <div className="absolute inset-x-0 top-[15%] flex justify-center px-4">
                <span className="fx-text select-none text-center">FANTASTIC</span>
            </div>
        </div>
    );
}