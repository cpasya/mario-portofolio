"use client";

import { useGameStore } from "@/store/useGameStore";

// Tombol keluar dari castle -> balik ke overworld (lewat transisi fade).
// Posisi: pojok kanan atas, DI SEBELAH KIRI tombol sound (right-4) biar gak numpuk.
export default function CastleExit() {
    const exitCastle = useGameStore((s) => s.exitCastle);
    const pendingScene = useGameStore((s) => s.pendingScene);

    return (
        <button
            onClick={exitCastle}
            disabled={!!pendingScene}
            className="pointer-events-auto absolute right-[4.5rem] top-4 z-20 flex items-center gap-2 rounded-xl border-2 border-[#3a3550] bg-black/55 px-3 py-2 font-mono text-xs font-bold text-amber-100 shadow-lg backdrop-blur transition hover:bg-black/75 disabled:opacity-40 sm:px-4 sm:text-sm"
        >
            ← Keluar Castle
        </button>
    );
}