"use client";

import dynamic from "next/dynamic";

// R3F + Rapier butuh browser (WebGL / WASM), jadi SSR dimatikan.
const Game = dynamic(() => import("@/components/Game"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#5c94fc] font-mono text-white">
      Memuat dunia…
    </div>
  ),
});

export default function Page() {
  return <Game />;
}