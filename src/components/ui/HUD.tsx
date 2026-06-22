"use client";

import { useGameStore } from "@/store/useGameStore";

export default function HUD() {
  const coins = useGameStore((s) => s.coins);
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl bg-black/40 px-4 py-2 font-mono text-white shadow-lg backdrop-blur">
      <span className="text-2xl leading-none">\ud83e\ude99</span>
      <span className="text-xl font-bold tabular-nums">Koin {coins}</span>
    </div>
  );
}
