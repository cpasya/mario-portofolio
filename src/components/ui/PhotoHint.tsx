"use client";

import { useGameStore } from "@/store/useGameStore";

const CSS = `
.ph-pop { animation: phPop .2s ease-out both; }
@keyframes phPop {
  from { opacity: 0; transform: translateY(10px) }
  to   { opacity: 1; transform: translateY(0) }
}
`;

export default function PhotoHint() {
    const nearPhoto = useGameStore((s) => s.nearPhoto);
    const activePhoto = useGameStore((s) => s.activePhoto);
    const openPhoto = useGameStore((s) => s.tryOpenPhoto);

    if (!nearPhoto || activePhoto) return null;

    return (
        <div className="absolute inset-x-0 bottom-28 z-30 flex justify-center px-4 sm:bottom-32">
            <style>{CSS}</style>
            <button
                onClick={openPhoto}
                className="ph-pop pointer-events-auto flex items-center gap-2 rounded-xl border-2 border-[#caa24a] bg-black/70 px-5 py-3 font-mono text-white shadow-2xl backdrop-blur transition hover:bg-black/85"
            >
                <span className="text-xl">🖼️</span>
                <span className="text-sm font-bold tracking-wide">
                    Tekan ↓ / ketuk buat lihat “{nearPhoto.title}”
                </span>
            </button>
        </div>
    );
}