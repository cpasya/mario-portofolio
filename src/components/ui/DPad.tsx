"use client";

import { useIsMobile } from "@/hooks/useIsMobile";
import { useGameStore, type ControlKey } from "@/store/useGameStore";

export default function DPad() {
  const isMobile = useIsMobile();
  const setControl = useGameStore((s) => s.setControl);
  const tryEnterPipe = useGameStore((s) => s.tryEnterPipe);
  const tryOpenPhoto = useGameStore((s) => s.tryOpenPhoto);

  if (!isMobile) return null;

  const hold = (k: ControlKey) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      setControl(k, true);
      if (k === "down") {
        tryEnterPipe();  // overworld
        tryOpenPhoto();  // castle
      }
    },
    onPointerUp: () => setControl(k, false),
    onPointerLeave: () => setControl(k, false),
    onPointerCancel: () => setControl(k, false),
  });

  const btn =
    "flex h-16 w-16 select-none items-center justify-center rounded-full bg-white/30 text-2xl text-white backdrop-blur active:bg-white/60";

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-6">
      <div className="pointer-events-auto flex gap-3">
        <button className={btn} aria-label="Kiri" {...hold("left")}>
          ◀
        </button>
        <button className={btn} aria-label="Kanan" {...hold("right")}>
          ▶
        </button>
      </div>
      <div className="pointer-events-auto flex gap-3">
        <button className={btn} aria-label="Turun / masuk pipa" {...hold("down")}>
          ▼
        </button>
        <button className={btn} aria-label="Lompat" {...hold("jump")}>
          ⤴
        </button>
      </div>
    </div>
  );
}