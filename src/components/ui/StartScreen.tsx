"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

// ============================================================================
//  CATATAN:
//  Start screen ini pakai CSS animation murni (bukan Framer Motion).
//
//  Judul, subtitle, dan tombol "Start Game" SENGAJA TANPA animasi muncul
//  (pop/fade) -> langsung tampil instan, biar gak ada jeda / judul kelihatan
//  telat atau aneh. Yang tersisa cuma animasi AMBIENT (loop terus):
//   - kedip "Tekan Enter"
//   - kotak ? + koin mantul-mantul
//   - awan geser pelan
// ============================================================================

/**
 * Anggap perangkat "mobile/tablet" kalau: layar sempit (<=1024px) ATAU sentuh.
 * Pakai width juga karena deteksi sentuh sering gagal di emulator/sebagian HP.
 */
function detectHandheld(): boolean {
    if (typeof window === "undefined") return false;
    const narrow = window.matchMedia("(max-width: 1024px)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    return narrow || coarse || touch;
}

const CSS = `
/* kedip terus (Press Start ala Mario) */
.ss-blink { animation: ssBlink 1.1s steps(1,end) infinite; }
@keyframes ssBlink { 0%,100% { opacity: 1 } 50% { opacity: .15 } }

/* kotak ? + koin mantul terus */
.ss-bob { animation: ssBob 1.1s ease-in-out infinite; }
@keyframes ssBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }

/* awan geser pelan */
.ss-cloud  { animation: ssCloudA 9s ease-in-out infinite; }
.ss-cloud2 { animation: ssCloudB 11s ease-in-out infinite; }
@keyframes ssCloudA { 0%,100% { transform: translateX(0) } 50% { transform: translateX(30px) } }
@keyframes ssCloudB { 0%,100% { transform: translateX(0) } 50% { transform: translateX(-24px) } }
`;

export default function StartScreen() {
    const started = useGameStore((s) => s.started);
    const startGame = useGameStore((s) => s.startGame);

    // Lazy initializer -> kebaca benar di render pertama (client), gak nunggu effect.
    const [handheld, setHandheld] = useState<boolean>(detectHandheld);

    useEffect(() => {
        const check = () => setHandheld(detectHandheld());
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Enter buat mulai (selalu aktif; di HP cukup ketuk tombol).
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!started && e.key === "Enter") {
                e.preventDefault();
                startGame();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [started, startGame]);

    if (started) return null;

    return (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#5c94fc] to-[#9ad0ff] font-mono">
            <style>{CSS}</style>

            {/* awan dekoratif */}
            <div className="ss-cloud pointer-events-none absolute left-[12%] top-[16%] text-6xl">
                ☁️
            </div>
            <div className="ss-cloud2 pointer-events-none absolute right-[14%] top-[26%] text-5xl">
                ☁️
            </div>

            {/* kotak ? + koin mantul-mantul */}
            <div className="ss-bob mb-6 flex items-center gap-4 text-5xl">
                <span className="grid h-16 w-16 place-items-center rounded-lg bg-[#f7b733] text-3xl font-black text-[#7c5320] shadow-[inset_0_-6px_0_rgba(0,0,0,0.25)]">
                    ?
                </span>
                <span>🪙</span>
            </div>

            {/* judul (tanpa animasi muncul -> langsung tampil) */}
            <h1 className="select-none text-center text-5xl font-black uppercase tracking-tight text-white drop-shadow-[3px_4px_0_#1c4fa0] sm:text-7xl">
                CPASYA WORLD
            </h1>
            <p className="mt-2 text-sm text-white/90 sm:text-base">
                Petualangan Portofolio · ala Mario Bros
            </p>

            {/* Tombol start: muncul di HP / tablet. Laptop pakai Enter. */}
            {handheld ? (
                <>
                    <button
                        onClick={startGame}
                        className="mt-10 rounded-xl border-b-4 border-[#b01b12] bg-[#e23b2e] px-10 py-4 text-2xl font-black uppercase tracking-wide text-white shadow-lg transition-transform duration-150 hover:scale-105 hover:bg-[#f04437] active:scale-95"
                    >
                        ▶ Start Game
                    </button>
                    <div className="ss-blink mt-6 text-xs uppercase tracking-widest text-white/90 sm:text-sm">
                        Ketuk tombol buat mulai
                    </div>
                </>
            ) : (
                <div className="ss-blink mt-12 text-base uppercase tracking-[0.3em] text-white drop-shadow-[2px_2px_0_#1c4fa0] sm:text-xl">
                    Tekan Enter buat mulai
                </div>
            )}
        </div>
    );
}
