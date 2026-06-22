"use client";

import { useEffect, useState } from "react";

// Deteksi dihitung SINKRON (langsung), bukan nunggu useEffect, biar UI yang
// bergantung sama ini (tombol Start, D-Pad) gak telat/flicker pas load awal.

function detectMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window
  );
}

function detectTouch(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

/** True jika layar kecil atau perangkat sentuh (buat nampilin D-Pad). */
export function useIsMobile() {
  // Lazy initializer -> nilai bener langsung di render pertama (client).
  const [isMobile, setIsMobile] = useState<boolean>(detectMobile);
  useEffect(() => {
    const check = () => setIsMobile(detectMobile());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

/**
 * True khusus untuk perangkat sentuh (HP / tablet), bukan laptop biasa.
 * Dipakai buat nentuin kapan tombol "Start Game" muncul.
 */
export function useIsTouchDevice() {
  // Lazy initializer -> tombol mobile langsung kebaca, gak nunggu effect.
  const [touch, setTouch] = useState<boolean>(detectTouch);
  useEffect(() => {
    const check = () => setTouch(detectTouch());
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return touch;
}