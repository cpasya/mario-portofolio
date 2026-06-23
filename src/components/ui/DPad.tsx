"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useGameStore, type ControlKey } from "@/store/useGameStore";

export default function DPad() {
  const isMobile = useIsMobile();
  const setControl = useGameStore((s) => s.setControl);
  const tryEnterPipe = useGameStore((s) => s.tryEnterPipe);
  const tryOpenPhoto = useGameStore((s) => s.tryOpenPhoto);

  // Map pointerId -> tombol yang lagi ditahan jari itu.
  // Tujuannya: tiap jari dilepas, kita matiin key yang TEPAT — walau jarinya
  // udah geser keluar dari area tombol sebelum dilepas. Juga support multi-touch
  // (mis. tahan "kanan" sambil "lompat").
  const activePointers = useRef<Map<number, ControlKey>>(new Map());

  // Jarak (px) dari bawah layout-viewport ke bawah area yang BENERAN KELIATAN.
  // Di HP layar gede, toolbar/gesture-bar browser "makan" bagian bawah, dan
  // env(safe-area-inset-bottom) sering dilaporin 0 (terutama Chrome Android)
  // -> D-Pad jadi ketutup/terpotong. Kita ukur sendiri pakai visualViewport.
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;
    const update = () => {
      // innerHeight = tinggi layout viewport (tetap).
      // vv.height + vv.offsetTop = batas bawah area yang keliatan.
      // Selisihnya = tinggi toolbar/gesture-bar yang nutupin bawah.
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setBottomInset(inset);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // === SAFETY NET GLOBAL (kunci anti-nyangkut / "ke-teken terus") ===
  // Dengernya di window, bukan di tombol. Jadi apapun yang terjadi (jari lepas
  // di luar tombol, gesture dibatalin browser -> pointercancel, pindah tab,
  // window blur) -> key yang lagi nyala PASTI dimatiin.
  useEffect(() => {
    const releaseOne = (e: PointerEvent) => {
      const key = activePointers.current.get(e.pointerId);
      if (key) {
        setControl(key, false);
        activePointers.current.delete(e.pointerId);
      }
    };
    const releaseAll = () => {
      activePointers.current.forEach((key) => setControl(key, false));
      activePointers.current.clear();
    };
    const onVisibility = () => {
      if (document.hidden) releaseAll();
    };

    window.addEventListener("pointerup", releaseOne);
    window.addEventListener("pointercancel", releaseOne);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointerup", releaseOne);
      window.removeEventListener("pointercancel", releaseOne);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", onVisibility);
      releaseAll();
    };
  }, [setControl]);

  if (!isMobile) return null;

  const press = (k: ControlKey) => (e: React.PointerEvent) => {
    // Cegah browser nganggep sentuhan ini sebagai scroll / zoom / double-tap,
    // yang bikin tombol "gak responsif".
    e.preventDefault();
    // Lepas "implicit pointer capture" bawaan touch, biar pelepasan jari
    // diurus listener global di window (lebih anti-nyangkut & multi-touch aman).
    try {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    } catch {
      /* no-op */
    }
    activePointers.current.set(e.pointerId, k);
    setControl(k, true);
    if (k === "down") {
      // Overworld: masuk pipa. Castle: buka frame foto terdekat.
      tryEnterPipe();
      tryOpenPhoto();
    }
  };

  const btn =
    "pointer-events-auto flex h-16 w-16 touch-none select-none items-center " +
    "justify-center rounded-full bg-white/30 text-2xl text-white backdrop-blur " +
    "active:bg-white/60";

  // touch-action / user-select juga diset inline buat jaga-jaga kalau util
  // Tailwind ke-purge atau beda versi.
  const btnStyle: React.CSSProperties = {
    touchAction: "none",
    WebkitUserSelect: "none",
    userSelect: "none",
    WebkitTouchCallout: "none",
    WebkitTapHighlightColor: "transparent",
  };

  const noContext = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      // FIXED (bukan absolute) -> lolos dari overflow-hidden parent & selalu
      // ngikut viewport. Posisi bawahnya = di atas toolbar (bottomInset) yang
      // diukur via visualViewport, jadi GAK ketutup di layar gede.
      className="pointer-events-none fixed inset-x-0 z-20 flex items-end justify-between"
      style={{
        // Naikin D-Pad ke atas toolbar/gesture-bar (hasil ukur JS).
        bottom: `${bottomInset}px`,
        // Jarak nyaman dari tepi + safe-area (notch/home-indicator iOS).
        paddingTop: "1.5rem",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <div className="pointer-events-auto flex gap-3">
        <button
          type="button"
          className={btn}
          style={btnStyle}
          aria-label="Kiri"
          onPointerDown={press("left")}
          onContextMenu={noContext}
        >
          ◀
        </button>
        <button
          type="button"
          className={btn}
          style={btnStyle}
          aria-label="Kanan"
          onPointerDown={press("right")}
          onContextMenu={noContext}
        >
          ▶
        </button>
      </div>
      <div className="pointer-events-auto flex gap-3">
        <button
          type="button"
          className={btn}
          style={btnStyle}
          aria-label="Turun / masuk pipa / buka foto"
          onPointerDown={press("down")}
          onContextMenu={noContext}
        >
          ▼
        </button>
        <button
          type="button"
          className={btn}
          style={btnStyle}
          aria-label="Lompat"
          onPointerDown={press("jump")}
          onContextMenu={noContext}
        >
          ⤴
        </button>
      </div>
    </div>
  );
}