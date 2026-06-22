// ============================================================================
//  SATU AudioContext dipakai bareng buat SFX (sound.ts) & musik (music.ts).
//
//  Disimpan di globalThis biar GAK kebikin berkali-kali waktu:
//    - dev Fast Refresh / HMR (pas lu edit file)
//    - komponen re-mount (mis. extension device-emulation yg reload halaman)
//  Tujuannya: cegah AudioContext numpuk -> anti-lag & anti-audio-dobel.
// ============================================================================

type WithCtx = typeof globalThis & { __cpasyaAudioCtx?: AudioContext | null };

export function getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const g = globalThis as WithCtx;
    if (!g.__cpasyaAudioCtx) {
        const AC =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
                .webkitAudioContext;
        if (!AC) return null;
        g.__cpasyaAudioCtx = new AC();
    }
    return g.__cpasyaAudioCtx ?? null;
}

/** Resume context (harus dipanggil dalam gesture user pertama). */
export function resumeAudio(): void {
    const c = getAudioContext();
    if (c && c.state === "suspended") void c.resume();
}