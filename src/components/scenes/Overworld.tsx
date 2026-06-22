"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, type RapierRigidBody } from "@react-three/rapier";
import Player from "../Player";
import Ground from "../Ground";
import Box from "../Box";
import Pipe from "../Pipe";
import Sign from "../Sign";
import Clouds from "../Clouds";
import CameraRig from "../CameraRig";
import Castle from "../Castle";
import HUD from "../ui/HUD";
import Card from "../ui/Card";
import DPad from "../ui/DPad";
import Intro from "../ui/Intro";
import StartScreen from "../ui/StartScreen";
import SoundButton from "../ui/SoundButton";
import FantasticFx from "../ui/FantasticFx";
import SkyBody from "../ui/SkyBody";
import StarField from "../ui/StarField";
import RainbowOverlay from "../ui/RainbowOverlay";
import GatePopup from "../ui/GatePopup";
import RainOverlay from "../ui/RainOverlay";
import WeatherButton from "../ui/WeatherButton";
import { boxes, pipes, signs } from "@/data/portfolio";
import { useGameStore } from "@/store/useGameStore";

// Gradasi langit per cuaca (CSS gradient) biar lebih aesthetic, ga flat/murahan.
const SKY_GRADIENT: Record<string, string> = {
    morning:
        "linear-gradient(180deg, #2f6fd0 0%, #5c94fc 38%, #9ec8ff 70%, #ffe7c2 100%)",
    night:
        "linear-gradient(180deg, #070b1d 0%, #121a3a 42%, #2b2a55 78%, #4a3f6b 100%)",
    rain: "linear-gradient(180deg, #353c49 0%, #4c5563 48%, #6a7585 100%)",
};

const SKY_BASE: Record<string, string> = {
    morning: "#5c94fc",
    night: "#10182e",
    rain: "#5a6472",
};

// ============================================================================
//  OVERWORLD = dunia luar (dunia awal). Isinya persis Game lama.
// ============================================================================
export default function Overworld() {
    const playerRef = useRef<RapierRigidBody | null>(null);
    const weather = useGameStore((s) => s.weather);
    // Ambil posisi spawn SEKALI pas mount: kalau baru balik dari castle, ini
    // bernilai depan-gerbang; selain itu 0 (awal level).
    const spawnX = useRef(useGameStore.getState().overworldSpawnX).current;

    const skyGradient = SKY_GRADIENT[weather];
    const skyBase = SKY_BASE[weather];

    return (
        <div
            className="fixed inset-0 h-screen w-screen overflow-hidden transition-[background] duration-700 ease-in-out"
            style={{ backgroundColor: skyBase, backgroundImage: skyGradient }}
        >
            {/* Pelangi samar (pagi) - di belakang canvas, jadi di balik awan. */}
            <RainbowOverlay />
            {/* Bintang malam (CSS) - di belakang canvas biar di langit, di balik awan/karakter. */}
            <StarField />

            <Canvas
                orthographic
                camera={{ position: [0, 3, 20], zoom: 62, near: 0.1, far: 1000 }}
                // PERF: cap DPR di 1.5 (bukan 2) -> di layar Retina hemat ~40% beban
                // fragment-shading. antialias dimatiin (sprite pixel-art NearestFilter
                // gak butuh MSAA, plane-nya kotak lurus). powerPreference minta GPU dedicated.
                dpr={[1, 1.5]}
                gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
                style={{ background: "transparent" }}
            >
                {/* Canvas transparan -> gradasi langit dari <div> di belakang keliatan. */}
                <ambientLight intensity={1} />
                <Clouds />
                <Physics gravity={[0, -30, 0]}>
                    <Ground />
                    <Player playerRef={playerRef} spawnX={spawnX} />
                    {boxes.map((b) => (
                        <Box key={b.card.id} x={b.x} card={b.card} />
                    ))}
                    {pipes.map((p) => (
                        <Pipe key={p.card.id} x={p.x} card={p.card} />
                    ))}
                    {/* Castle background + sensor gerbang di ujung kanan dunia. */}
                    <Castle />
                    <CameraRig playerRef={playerRef} />
                </Physics>
                {signs.map((s, i) => (
                    <Sign key={i} x={s.x} text={s.text} />
                ))}
            </Canvas>

            <SkyBody />
            <RainOverlay />
            <HUD />
            <GatePopup />
            <SoundButton />
            <WeatherButton />
            <DPad />
            <Card />
            <FantasticFx />
            <Intro />
            <StartScreen />
        </div>
    );
}