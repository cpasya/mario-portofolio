"use client";

import { useMemo, type CSSProperties } from "react";
import { useGameStore } from "@/store/useGameStore";

// ============================================================================
//  BINTANG MALAM - cuma muncul pas cuaca "night".
//   - Titik kuning kecil tersebar di area langit (bagian atas layar).
//   - Posisi/ukuran di-generate SEKALI (useMemo) biar stabil & ga nge-lag.
//   - Kedip (twinkle) pakai CSS animation murni -> ringan, GPU-friendly.
// ============================================================================

type Star = {
    left: number; // %
    top: number; // %
    size: number; // px
    delay: number; // s
    dur: number; // s
};

const STAR_COUNT = 80;

const CSS = `
.starfield { animation: starFieldIn 1.2s ease-out both; }
@keyframes starFieldIn { from { opacity: 0 } to { opacity: 1 } }

.star {
  position: absolute;
  border-radius: 9999px;
  background: #ffe46b;
  box-shadow: 0 0 4px 1px rgba(255, 220, 90, 0.65);
  animation-name: starTwinkle;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  will-change: opacity, transform;
}
@keyframes starTwinkle {
  0%, 100% { opacity: 1; transform: scale(1) }
  50% { opacity: 0.2; transform: scale(0.55) }
}
`;

function starStyle(s: Star): CSSProperties {
    return {
        left: `${s.left}%`,
        top: `${s.top}%`,
        width: `${s.size}px`,
        height: `${s.size}px`,
        animationDelay: `${s.delay}s`,
        animationDuration: `${s.dur}s`,
    };
}

export default function StarField() {
    const weather = useGameStore((s) => s.weather);

    // Generate sekali aja -> ga re-random tiap render.
    const stars = useMemo<Star[]>(() => {
        const arr: Star[] = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            arr.push({
                left: Math.random() * 100,
                top: Math.random() * 68, // area atas (langit), ga sampe tanah
                size: 1 + Math.random() * 2.5,
                delay: Math.random() * 4,
                dur: 2.5 + Math.random() * 3,
            });
        }
        return arr;
    }, []);

    if (weather !== "night") return null;

    return (
        <div className="starfield pointer-events-none absolute inset-0 overflow-hidden">
            <style>{CSS}</style>
            {stars.map((s, i) => (
                <span key={i} className="star" style={starStyle(s)} />
            ))}
        </div>
    );
}