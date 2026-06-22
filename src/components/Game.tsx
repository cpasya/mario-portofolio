"use client";

import { useGameStore } from "@/store/useGameStore";
import { useKeyboard } from "@/hooks/useKeyboard";
import Overworld from "./scenes/Overworld";
import CastleScene from "./scenes/CastleScene";
import SceneTransition from "./ui/SceneTransition";

// Game = SHELL tipis: pilih scene aktif + overlay transisi + keyboard global.
// Pas pindah scene, scene lama di-UNMOUNT total -> Physics & useFrame berhenti.
export default function Game() {
  const scene = useGameStore((s) => s.scene);
  useKeyboard();

  return (
    <>
      {scene === "castle" ? <CastleScene /> : <Overworld />}
      <SceneTransition />
    </>
  );
}