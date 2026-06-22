"use client";

import { useEffect } from "react";
import { useGameStore, type ControlKey } from "@/store/useGameStore";

const KEY_MAP: Record<string, ControlKey> = {
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
  ArrowUp: "jump",
  w: "jump",
  W: "jump",
  " ": "jump",
  ArrowDown: "down",
  s: "down",
  S: "down",
};

export function useKeyboard() {
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const key = KEY_MAP[e.key];
      if (!key) return;
      e.preventDefault();
      const store = useGameStore.getState();
      store.setControl(key, true);
      // Tekan bawah saat dekat pipa = masuk checkpoint proyek.
      if (key === "down") {
        store.tryEnterPipe();  // overworld
        store.tryOpenPhoto();  // castle
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const key = KEY_MAP[e.key];
      if (!key) return;
      useGameStore.getState().setControl(key, false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);
}
