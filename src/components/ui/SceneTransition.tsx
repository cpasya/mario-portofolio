"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

const FADE_IN = 650;   // ms: terang -> hitam
const HOLD = 220;      // ms: tahan hitam (mount scene baru)
const FADE_OUT = 650;  // ms: hitam -> terang

const CSS = `
.scene-fade { background: #050409; }
.scene-fade.is-in  { animation: sceneFadeIn ${FADE_IN}ms ease-in forwards; }
.scene-fade.is-out { animation: sceneFadeOut ${FADE_OUT}ms ease-out forwards; }
@keyframes sceneFadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes sceneFadeOut { from { opacity: 1 } to { opacity: 0 } }

.scene-torch { animation: torchFlicker 1.1s ease-in-out infinite; }
@keyframes torchFlicker {
  0%, 100% { opacity: 1; transform: scale(1) }
  45% { opacity: .7; transform: scale(.92) }
  70% { opacity: .96; transform: scale(1.05) }
}
`;

export default function SceneTransition() {
    const pendingScene = useGameStore((s) => s.pendingScene);
    const commitScene = useGameStore((s) => s.commitScene);
    const endTransition = useGameStore((s) => s.endTransition);
    const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");

    useEffect(() => {
        if (!pendingScene) return;
        const timers: ReturnType<typeof setTimeout>[] = [];
        setPhase("in");
        timers.push(
            setTimeout(() => {
                commitScene();
                setPhase("out");
                timers.push(
                    setTimeout(() => {
                        setPhase("idle");
                        endTransition();
                    }, FADE_OUT),
                );
            }, FADE_IN + HOLD),
        );
        return () => timers.forEach(clearTimeout);
    }, [pendingScene, commitScene, endTransition]);

    if (phase === "idle") return null;

    const label = pendingScene === "overworld" ? "Kembali ke dunia…" : "Memasuki castle…";

    return (
        <div
            className={`scene-fade pointer-events-none fixed inset-0 z-[70] flex items-center justify-center ${phase === "in" ? "is-in" : "is-out"
                }`}
        >
            <style>{CSS}</style>
            <div className="flex flex-col items-center gap-3 font-mono text-amber-100">
                <span className="scene-torch text-5xl">🔥</span>
                <span className="text-lg font-bold tracking-wide">{label}</span>
            </div>
        </div>
    );
}