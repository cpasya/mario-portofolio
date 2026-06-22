"use client";

import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { playThunder } from "@/lib/sound";

// ============================================================================
//  Overlay HUJAN (cuma render saat weather === "rain").
//   - Tetesan air: ~110 garis tipis jatuh, animasi 100% CSS (transform) =>
//     GPU-composited, TANPA per-frame JS => anti-lag.
//   - Kilat: kilatan putih sesaat (flash) tiap 3.5–8.5 detik, lalu DIIKUTI
//     suara guntur (playThunder) — sesuai "background memutih sesaat diikuti
//     suara guntur".
//   - Timer dibersihin pas pindah cuaca / unmount (anti dobel audio).
// ============================================================================

const DROPS = 110;

const CSS = `
.rain-drop {
  position: absolute;
  top: -14vh;
  width: 2px;
  background: linear-gradient(to bottom, rgba(190,210,255,0), rgba(195,215,255,.85));
  transform: translateY(0) rotate(12deg);
  animation-name: rainFall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
@keyframes rainFall { to { transform: translateY(125vh) rotate(12deg); } }

.rain-flash { animation: rainFlash .7s ease-out both; }
@keyframes rainFlash {
  0% { opacity: 0 }
  8% { opacity: .85 }
  18% { opacity: .15 }
  28% { opacity: .7 }
  45% { opacity: 0 }
  100% { opacity: 0 }
}
`;

export default function RainOverlay() {
    const weather = useGameStore((s) => s.weather);
    const [flash, setFlash] = useState(0);

    // Properti tetesan dibuat sekali (stabil) biar gak re-randomize tiap render.
    const drops = useMemo(
        () =>
            Array.from({ length: DROPS }, () => ({
                left: Math.random() * 100,
                delay: Math.random() * 1.2,
                dur: 0.4 + Math.random() * 0.45,
                len: 14 + Math.random() * 24,
                op: 0.35 + Math.random() * 0.45,
            })),
        [],
    );

    useEffect(() => {
        if (weather !== "rain") return;
        let alive = true;
        const timers: ReturnType<typeof setTimeout>[] = [];
        const schedule = () => {
            const delay = 3500 + Math.random() * 5000;
            const t = setTimeout(() => {
                if (!alive) return;
                setFlash((f) => f + 1); // pemicu kilatan putih
                const tt = setTimeout(() => {
                    if (alive) playThunder(); // guntur menyusul setelah kilat
                }, 280);
                timers.push(tt);
                schedule();
            }, delay);
            timers.push(t);
        };
        schedule();
        return () => {
            alive = false;
            timers.forEach(clearTimeout);
        };
    }, [weather]);

    if (weather !== "rain") return null;

    return (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <style>{CSS}</style>

            {/* kilatan putih (key berubah tiap petir -> animasi restart) */}
            {flash > 0 && (
                <div key={flash} className="rain-flash absolute inset-0 bg-white" />
            )}

            {/* tetesan hujan */}
            {drops.map((d, i) => (
                <span
                    key={i}
                    className="rain-drop"
                    style={{
                        left: `${d.left}%`,
                        height: `${d.len}px`,
                        opacity: d.op,
                        animationDuration: `${d.dur}s`,
                        animationDelay: `${d.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}