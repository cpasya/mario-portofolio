"use client";

import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useGameStore, type ControlKey } from "@/store/useGameStore";

const BTN_BG = "rgba(255, 255, 255, 0.30)";
const BTN_BG_ACTIVE = "rgba(255, 255, 255, 0.60)";

// Tahan minimum (ms): kalau jari nempel sebentar BANGET, key tetap "nyala"
// minimal segini biar frame loop (Player) sempat baca walau FPS rendah di HP
// Android mid-bawah. Tanpa ini, tap super cepat bisa lewat di antara 2 frame.
const MIN_HOLD_MS = 140;

/**
 * Satu tombol D-Pad. KUNCI buat HP Android (mid ke bawah) yang delay:
 * input ditangani lewat NATIVE "touchstart" listener (passive:false), BUKAN
 * React onPointerDown. Di Android Chrome, pointer/synthetic event itu lebih
 * lambat (lewat event-delegation + lapisan pointer); native touchstart adalah
 * sinyal sentuh paling awal -> latensi minimal + bisa preventDefault buat
 * matiin delay 300ms, scroll-hijack, zoom, dan double-tap.
 */
function PadButton({
  control,
  label,
  ariaLabel,
}: {
  control: ControlKey;
  label: string;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pressedAt = 0;
    let releaseTimer: ReturnType<typeof setTimeout> | null = null;

    const setBg = (active: boolean) => {
      el.style.backgroundColor = active ? BTN_BG_ACTIVE : BTN_BG;
    };

    const press = () => {
      if (releaseTimer !== null) {
        clearTimeout(releaseTimer);
        releaseTimer = null;
      }
      pressedAt = Date.now();
      const s = useGameStore.getState();
      s.setControl(control, true);
      // Tombol bawah: di overworld masuk pipa, di castle buka foto terdekat.
      if (control === "down") {
        s.tryEnterPipe();
        s.tryOpenPhoto();
      }
      setBg(true);
    };

    const release = () => {
      // Visual balik normal langsung (ngikut jari).
      setBg(false);
      const held = Date.now() - pressedAt;
      const finish = () => {
        useGameStore.getState().setControl(control, false);
        releaseTimer = null;
      };
      // Jamin key nyala minimal MIN_HOLD_MS -> tap super cepat tetap kebaca
      // frame loop walau Android lagi lambat. (1 tekan tetap = 1 lompat karena
      // Player pakai edge-detection.)
      if (held < MIN_HOLD_MS) {
        releaseTimer = setTimeout(finish, MIN_HOLD_MS - held);
      } else {
        finish();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // butuh passive:false (di bawah) biar ini jalan
      press();
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      release();
    };

    // passive:false WAJIB di Android Chrome supaya preventDefault efektif.
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchcancel", onTouchEnd, { passive: false });
    // Fallback mouse (DevTools / perangkat hybrid). preventDefault di touch
    // udah nyegah mouse-event sintetis, jadi gak dobel.
    el.addEventListener("mousedown", press);
    window.addEventListener("mouseup", release);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("mousedown", press);
      window.removeEventListener("mouseup", release);
      if (releaseTimer !== null) clearTimeout(releaseTimer);
      // Pastikan key gak ketinggalan nyala saat unmount (mis. ganti scene).
      useGameStore.getState().setControl(control, false);
    };
  }, [control]);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      onContextMenu={(e) => e.preventDefault()}
      className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white backdrop-blur"
      style={{
        backgroundColor: BTN_BG,
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {label}
    </button>
  );
}

export default function DPad() {
  const isMobile = useIsMobile();
  const [bottomInset, setBottomInset] = useState(0);

  // Posisikan D-Pad di atas toolbar/gesture-bar HP (anti kepotong di layar gede).
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;
    const update = () => {
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

  // Safety net: matiin semua kontrol pas tab disembunyikan / window blur,
  // biar gak ada tombol "nyangkut" nyala.
  useEffect(() => {
    const clearAll = () => {
      const { setControl } = useGameStore.getState();
      (["left", "right", "jump", "down"] as ControlKey[]).forEach((k) =>
        setControl(k, false),
      );
    };
    const onVisibility = () => {
      if (document.hidden) clearAll();
    };
    window.addEventListener("blur", clearAll);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", clearAll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!isMobile) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-20 flex items-end justify-between"
      style={{
        bottom: `${bottomInset}px`,
        paddingTop: "1.5rem",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <div className="pointer-events-auto flex gap-3">
        <PadButton control="left" label="◀" ariaLabel="Kiri" />
        <PadButton control="right" label="▶" ariaLabel="Kanan" />
      </div>
      <div className="pointer-events-auto flex gap-3">
        <PadButton
          control="down"
          label="▼"
          ariaLabel="Turun / masuk pipa / buka foto"
        />
        <PadButton control="jump" label="▲" ariaLabel="Lompat" />
      </div>
    </div>
  );
}