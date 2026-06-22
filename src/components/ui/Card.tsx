"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useGameStore, type CardType } from "@/store/useGameStore";

// ============================================================================
//  Modal "PAPAN KAYU" - dipakai pas nyundul kotak ? & pas masuk pipa hijau.
//   - Bentuk papan kayu (gradient + serat + baut di pojok).
//   - SLIDER gambar CUMA buat card PROYEK (popup pipa hijau).
//     Card hasil nyundul kotak (intro/skill) gak nampilin slider sama sekali.
//   - Deskripsi (skill/proyek) ada di panel "kertas" biar enak dibaca.
//   - Animasi pakai CSS murni (bukan Framer Motion) biar aman & ringan.
//   - Responsif: lebar penuh + max-w-md, tinggi dibatasi & body bisa di-scroll.
// ============================================================================

function labelClass(type: CardType): string {
  switch (type) {
    case "intro":
      return "bg-gradient-to-r from-rose-500 to-orange-500";
    case "skill":
      return "bg-gradient-to-r from-sky-500 to-indigo-500";
    case "project":
      return "bg-gradient-to-r from-emerald-500 to-teal-500";
    default:
      return "bg-gradient-to-r from-sky-500 to-indigo-500";
  }
}

function placeholderClass(type: CardType): string {
  switch (type) {
    case "intro":
      return "bg-gradient-to-br from-rose-400 to-orange-500";
    case "skill":
      return "bg-gradient-to-br from-sky-400 to-indigo-500";
    case "project":
      return "bg-gradient-to-br from-emerald-400 to-teal-500";
    default:
      return "bg-gradient-to-br from-sky-400 to-indigo-500";
  }
}

function icon(type: CardType): string {
  switch (type) {
    case "intro":
      return "👋";
    case "skill":
      return "🛠️";
    case "project":
      return "🚀";
    default:
      return "🎮";
  }
}

function label(type: CardType): string {
  switch (type) {
    case "intro":
      return "Perkenalan";
    case "skill":
      return "Skill";
    case "project":
      return "Proyek";
    default:
      return "Info";
  }
}

// Tampilan papan kayu (gradient vertikal + serat papan + sedikit tekstur).
const woodStyle: CSSProperties = {
  backgroundColor: "#b3792f",
  backgroundImage:
    "repeating-linear-gradient(90deg, rgba(92,60,28,0) 0px, rgba(92,60,28,0) 52px, rgba(92,60,28,0.32) 54px, rgba(92,60,28,0) 56px), linear-gradient(180deg, #c08439 0%, #a96d2b 100%)",
};

const CSS = `
.card-overlay { animation: cardFade .18s ease-out both; }
@keyframes cardFade { from { opacity: 0 } to { opacity: 1 } }

.card-board { animation: cardPop .22s cubic-bezier(.2,.8,.2,1.1) both; }
@keyframes cardPop {
  from { opacity: 0; transform: translateY(40px) scale(.85) }
  to   { opacity: 1; transform: translateY(0) scale(1) }
}
`;

export default function Card() {
  const card = useGameStore((s) => s.activeCard);
  const close = useGameStore((s) => s.closeCard);
  const [slide, setSlide] = useState(0);

  // Tutup pakai ESC.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Reset slide ke awal tiap ganti card.
  useEffect(() => setSlide(0), [card?.id]);

  if (!card) return null;

  // Slider gambar CUMA buat card proyek (popup pipa hijau).
  const showSlider = card.type === "project";
  const images = card.images ?? [];
  const hasImages = images.length > 0;
  const count = hasImages ? images.length : 3; // placeholder 3 slide
  const go = (d: number) => setSlide((p) => (p + d + count) % count);

  return (
    <div
      className="card-overlay absolute inset-0 z-30 flex items-center justify-center p-4"
      onClick={close}
    >
      <style>{CSS}</style>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        style={woodStyle}
        className="card-board relative z-10 flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border-4 border-[#5c3c1c] font-mono shadow-2xl"
      >
        {/* baut pojok */}
        <span className="pointer-events-none absolute left-2 top-2 h-2.5 w-2.5 rounded-full bg-[#5c3c1c]/70" />
        <span className="pointer-events-none absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#5c3c1c]/70" />
        <span className="pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 rounded-full bg-[#5c3c1c]/70" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full bg-[#5c3c1c]/70" />

        {/* ============ SLIDER GAMBAR (atas) - CUMA buat card PROYEK ============ */}
        {showSlider ? (
          <div className="p-4 pb-0 sm:p-5 sm:pb-0">
            <div className="relative h-40 w-full overflow-hidden rounded-xl border-4 border-[#5c3c1c] bg-[#241708] shadow-inner sm:h-52">
              {hasImages ? (
                images.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`${card.title} slide ${idx + 1}`}
                    className={
                      "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 " +
                      (idx === slide ? "opacity-100" : "opacity-0")
                    }
                  />
                ))
              ) : (
                Array.from({ length: count }).map((_, idx) => (
                  <div
                    key={idx}
                    className={
                      "absolute inset-0 flex flex-col items-center justify-center gap-1 text-white transition-opacity duration-300 " +
                      (idx === slide ? "opacity-100 " : "opacity-0 ") +
                      placeholderClass(card.type)
                    }
                  >
                    <span className="text-5xl drop-shadow">{icon(card.type)}</span>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-90">
                      Slide {idx + 1}
                    </span>
                    <span className="px-6 text-center text-[10px] leading-snug opacity-75">
                      Tambah gambar lewat images di portfolio.ts
                    </span>
                  </div>
                ))
              )}

              {/* panah kiri/kanan (muncul kalau lebih dari 1 slide) */}
              {count > 1 ? (
                <>
                  <button
                    onClick={() => go(-1)}
                    aria-label="Slide sebelumnya"
                    className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/70"
                  >
                    {"\u2039"}
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label="Slide berikutnya"
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition hover:bg-black/70"
                  >
                    {"\u203a"}
                  </button>

                  {/* titik indikator */}
                  <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                    {Array.from({ length: count }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSlide(idx)}
                        aria-label={`Ke slide ${idx + 1}`}
                        className={
                          "h-2 rounded-full transition-all " +
                          (idx === slide ? "w-5 bg-white" : "w-2 bg-white/50")
                        }
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* ====================== KONTEN (scroll) ====================== */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <span
            className={
              "inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow " +
              labelClass(card.type)
            }
          >
            {label(card.type)}
          </span>

          <h2 className="mt-2 text-2xl font-black leading-tight text-[#fff3dc] drop-shadow-[2px_2px_0_#5c3c1c]">
            {card.title}
          </h2>
          {card.subtitle ? (
            <p className="text-sm font-semibold text-[#ffe7c2] drop-shadow-[1px_1px_0_#5c3c1c]">
              {card.subtitle}
            </p>
          ) : null}

          {/* panel "kertas" biar deskripsi enak dibaca */}
          <div className="mt-3 rounded-xl border border-[#c9a567] bg-[#fdf4df] p-4 shadow-inner">
            <p className="whitespace-pre-line font-sans text-[15px] leading-relaxed text-[#3b2613]">
              {card.body}
            </p>

            {card.tags && card.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {card.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#cdb583] bg-[#ecdcb6] px-3 py-1 text-xs font-bold text-[#5c3c1c]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <button
            onClick={close}
            className="mt-5 w-full rounded-xl border-b-4 border-[#b01b12] bg-[#e23b2e] py-3 text-lg font-black uppercase tracking-wide text-white shadow-lg transition-transform duration-150 hover:bg-[#f04437] active:scale-95"
          >
            Tutup
          </button>
          <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-[#fff3dc]/70">
            Tekan ESC / ketuk luar buat nutup
          </p>
        </div>
      </div>
    </div>
  );
}