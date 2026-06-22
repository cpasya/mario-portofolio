"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";

const CSS = `
.gal-overlay { animation: galFade .18s ease-out both; }
@keyframes galFade { from { opacity: 0 } to { opacity: 1 } }
.gal-pop { animation: galPop .24s cubic-bezier(.2,.8,.2,1.1) both; }
@keyframes galPop {
  from { opacity: 0; transform: translateY(30px) scale(.9) }
  to   { opacity: 1; transform: translateY(0) scale(1) }
}
`;

export default function GalleryPopup() {
    const photo = useGameStore((s) => s.activePhoto);
    const close = useGameStore((s) => s.closePhoto);
    const [err, setErr] = useState(false);

    useEffect(() => setErr(false), [photo?.id]);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [close]);

    if (!photo) return null;
    const showImg = photo.src && !err;

    return (
        <div className="gal-overlay absolute inset-0 z-40 flex items-center justify-center p-4" onClick={close}>
            <style>{CSS}</style>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <figure
                onClick={(e) => e.stopPropagation()}
                className="gal-pop relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-4 border-[#caa24a] bg-[#0d0b12] font-mono shadow-2xl"
            >
                <div className="relative flex min-h-[40vh] flex-1 items-center justify-center bg-black">
                    {showImg ? (
                        <img
                            src={photo.src}
                            alt={photo.title}
                            loading="lazy"
                            decoding="async"
                            onError={() => setErr(true)}
                            className="max-h-[70vh] w-full object-contain"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-amber-100/80">
                            <span className="text-6xl">🖼️</span>
                            <span className="text-sm">
                                foto di <code className="text-amber-200">{photo.src || "/gallery/…"}</code>
                            </span>
                        </div>
                    )}
                </div>

                <figcaption className="border-t-2 border-[#3a3550] bg-[#12101a] px-5 py-4 text-amber-50">
                    <h3 className="text-lg font-bold">{photo.title}</h3>
                    {photo.caption ? (
                        <p className="mt-1 text-sm leading-snug text-amber-100/75">{photo.caption}</p>
                    ) : null}
                </figcaption>

                <button
                    onClick={close}
                    aria-label="Tutup"
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black/80"
                >
                    ✕
                </button>
            </figure>
        </div>
    );
}