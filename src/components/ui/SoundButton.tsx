"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";

/**
 * Tombol mute / putar musik latar (logo sound).
 * Posisinya di POJOK KANAN ATAS (di mobile maupun desktop).
 * Disembunyikan sebelum game dimulai (masih ketutup start screen).
 */
export default function SoundButton() {
    const started = useGameStore((s) => s.started);
    const musicOn = useGameStore((s) => s.musicOn);
    const toggleMusic = useGameStore((s) => s.toggleMusic);

    if (!started) return null;

    return (
        <motion.button
            onClick={toggleMusic}
            whileTap={{ scale: 0.9 }}
            aria-label={musicOn ? "Matikan musik" : "Nyalakan musik"}
            title={musicOn ? "Matikan musik" : "Nyalakan musik"}
            className="pointer-events-auto absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-xl text-white shadow-lg backdrop-blur transition-colors hover:bg-black/60"
        >
            {musicOn ? "🔊" : "🔇"}
        </motion.button>
    );
}