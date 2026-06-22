"use client";

import { useState } from "react";
import { useGameStore, type Weather } from "@/store/useGameStore";

// ============================================================================
//  Tombol pemilih cuaca (pojok kanan atas, di sebelah tombol sound).
//  Diklik -> muncul PAPAN pop-up berisi 3 pilihan: Morning / Night / Rain.
//  Disembunyikan sebelum game dimulai.
// ============================================================================

const OPTIONS: { id: Weather; label: string; icon: string }[] = [
    { id: "morning", label: "Morning", icon: "☀️" },
    { id: "night", label: "Night", icon: "🌙" },
    { id: "rain", label: "Rain", icon: "🌧️" },
];

const ICON: Record<Weather, string> = {
    morning: "☀️",
    night: "🌙",
    rain: "🌧️",
};

const CSS = `
.weather-pop { transform-origin: top right; animation: weatherPopIn .18s ease-out both; }
@keyframes weatherPopIn {
  from { opacity: 0; transform: scale(.85) }
  to   { opacity: 1; transform: scale(1) }
}
`;

export default function WeatherButton() {
    const started = useGameStore((s) => s.started);
    const weather = useGameStore((s) => s.weather);
    const setWeather = useGameStore((s) => s.setWeather);
    const [open, setOpen] = useState(false);

    if (!started) return null;

    return (
        <>
            <style>{CSS}</style>

            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Pilih cuaca"
                title="Pilih cuaca"
                className="pointer-events-auto absolute right-20 top-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-black/40 text-xl text-white shadow-lg backdrop-blur transition-colors hover:bg-black/60"
            >
                {ICON[weather]}
            </button>

            {open && (
                <>
                    {/* lapisan tembus pandang: klik di luar papan utk menutup */}
                    <div
                        className="absolute inset-0 z-30"
                        onClick={() => setOpen(false)}
                    />

                    {/* papan pop-up pilihan cuaca */}
                    <div className="weather-pop pointer-events-auto absolute right-4 top-[4.25rem] z-40 w-44 rounded-2xl border-4 border-[#7c5320] bg-gradient-to-b from-[#d9974a] to-[#c07f33] p-3 shadow-2xl">
                        <div className="mb-2 text-center font-mono text-sm font-black uppercase tracking-wide text-[#4a2f12]">
                            Cuaca
                        </div>
                        <div className="flex flex-col gap-2">
                            {OPTIONS.map((o) => {
                                const active = o.id === weather;
                                return (
                                    <button
                                        key={o.id}
                                        onClick={() => {
                                            setWeather(o.id);
                                            setOpen(false);
                                        }}
                                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-left font-mono text-sm font-bold transition-transform active:scale-95 ${active
                                                ? "border-[#4a2f12] bg-[#fff2d6] text-[#4a2f12]"
                                                : "border-[#a06a2a] bg-[#e9b873] text-[#4a2f12] hover:bg-[#f3cd93]"
                                            }`}
                                    >
                                        <span className="text-lg">{o.icon}</span>
                                        {o.label}
                                        {active && <span className="ml-auto">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}