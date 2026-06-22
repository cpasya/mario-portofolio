"use client";

import { useMemo } from "react";
import { drawSign, toTexture } from "@/lib/sprites";

// y = 0.75 => sisi bawah papan (tinggi plane 1.5) pas menyentuh tanah (y = 0),
// jadi tiang papan menancap di ground, gak melayang lagi.
export default function Sign({
  x,
  y = 0.75,
  text,
}: {
  x: number;
  y?: number;
  text: string;
}) {
  const tex = useMemo(() => toTexture(drawSign(text)), [text]);
  return (
    <mesh position={[x, y, -0.6]}>
      <planeGeometry args={[3, 1.5]} />
      <meshBasicMaterial map={tex} transparent />
    </mesh>
  );
}