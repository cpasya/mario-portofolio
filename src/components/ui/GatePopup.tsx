"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

const CSS = `
.gate-pop { animation: gatePop .2s ease-out both; }
@keyframes gatePop {
  from { opacity: 0; transform: translateY(10px) }
  to   { opacity: 1; transform: translateY(0) }
}
`;

export default function GatePopup() {
    const nearGate = useGameStore((s) => s.nearGate);
    const pendingScene = useGameStore((s) => s.pendingScene);
    const enterCastle = useGameStore((s) => s.enterCastle);

    useEffect(() => {
        if (!nearGate) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                enterCastle();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [nearGate, enterCastle]);

    if (!nearGate || pendingScene) return null;

    return (
        <div className="absolute inset-x-0 top-24 z-30 flex justify-center px-4">
            <style>{CSS}</style>
            <div className="gate-pop flex flex-col items-center gap-3 rounded-xl border-2 border-[#5c3c1c] bg-black/75 px-6 py-4 font-mono text-white shadow-2xl backdrop-blur">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🏰</span>
                    <span className="text-base font-bold tracking-wide">Masuk ke dalam castle?</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={enterCastle}
                        className="pointer-events-auto rounded-lg border-2 border-amber-300 bg-amber-400/90 px-4 py-1.5 text-sm font-bold text-amber-950 transition hover:bg-amber-300"
                    >
                        Masuk →
                    </button>
                    <span className="text-xs text-white/60">atau tekan Enter</span>
                </div>
            </div>
        </div>
    );
}