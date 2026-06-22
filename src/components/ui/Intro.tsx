"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useGameStore } from "@/store/useGameStore";

export default function Intro() {
  const started = useGameStore((s) => s.started);
  const [show, setShow] = useState(false);
  const isMobile = useIsMobile();

  // Tampil setelah "Start Game" ditekan, lalu hilang otomatis 7 detik.
  useEffect(() => {
    if (!started) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 7000);
    return () => clearTimeout(t);
  }, [started]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          className="pointer-events-none absolute left-1/2 top-20 z-20 max-w-[92vw] -translate-x-1/2 rounded-xl bg-black/50 px-5 py-3 text-center font-mono text-sm text-white backdrop-blur sm:top-4"
        >
          {isMobile
            ? "Pakai tombol di layar buat gerak & lompat. Sundul kotak ↑, dekati pipa lalu tekan ↓."
            : "\u25c0 \u25b6 jalan \u00b7 Spasi / \u2191 lompat \u00b7 sundul kotak ↑ \u00b7 di pipa tekan ↓"}
        </motion.div>
      )}
    </AnimatePresence>
  );
}