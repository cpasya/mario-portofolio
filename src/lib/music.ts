// ============================================================================
//  MUSIK LATAR (background music) game.
//
//  >>> WADAH MUSIK SENDIRI <<<
//  Mau pakai lagu sendiri? Taruh file audio di folder /public, contoh:
//      /public/music/bg.mp3
//  lalu isi MUSIC_SRC di bawah jadi:
//      export const MUSIC_SRC = "/music/bg.mp3";
//
//  - Kalau MUSIC_SRC DIISI  -> file itu yang diputar (looping otomatis).
//  - Kalau MUSIC_SRC null    -> dipakai musik chiptune DEFAULT bawaan.
// ============================================================================

import { getAudioContext, resumeAudio } from "./audioCtx";

export const MUSIC_SRC: string | null = null;

// >>> MUSIK KHUSUS DALAM CASTLE <<<
// Taruh lagu lu di /public/music/ (mp3 ATAU mp4), contoh /public/music/castle.mp3,
// lalu samain path di bawah. Pas MASUK castle, musik luar BERHENTI dan lagu ini
// yang diputar (looping). Pas KELUAR castle, balik lagi ke musik luar.
// Kalau null -> castle pakai musik default yang sama kaya di luar.
export const CASTLE_MUSIC_SRC: string | null = "/music/castle.mp3";

// --- Musik default (chiptune prosedural) ------------------------------------

const MELODY = [
    523, 659, 784, 659, 587, 698, 880, 698,
    523, 659, 784, 1047, 988, 784, 659, 587,
];
const BASS = [131, 147, 131, 98];
const STEP = 0.22;

type MusicMode = "off" | "overworld" | "castle";

type MusicState = {
    master: GainNode | null;
    audioEl: HTMLAudioElement | null;
    castleEl: HTMLAudioElement | null;
    timer: ReturnType<typeof setTimeout> | null;
    step: number;
    playing: boolean;
    runId: number;
    mode: MusicMode;
};

// Singleton di globalThis -> bertahan lintas HMR / re-mount.
const S: MusicState = ((globalThis as typeof globalThis & {
    __cpasyaMusic?: MusicState;
}).__cpasyaMusic ??= {
    master: null,
    audioEl: null,
    castleEl: null,
    timer: null,
    step: 0,
    playing: false,
    runId: 0,
    mode: "off",
});

function getMaster(): GainNode | null {
    const c = getAudioContext();
    if (!c) return null;
    if (!S.master) {
        S.master = c.createGain();
        S.master.gain.value = 0.5;
        S.master.connect(c.destination);
    }
    return S.master;
}

function blip(freq: number, dur: number, type: OscillatorType, gain: number) {
    const c = getAudioContext();
    const master = getMaster();
    if (!c || !master || freq <= 0) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.9);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur);
    osc.onended = () => {
        osc.disconnect();
        g.disconnect();
    };
}

function tick(runId: number) {
    if (!S.playing || runId !== S.runId) return;
    blip(MELODY[S.step % MELODY.length], STEP * 0.95, "square", 0.09);
    if (S.step % 4 === 0) {
        blip(BASS[(S.step / 4) % BASS.length], STEP * 3.6, "triangle", 0.12);
    }
    S.step += 1;
    S.timer = setTimeout(() => tick(runId), STEP * 1000);
}

/** Mulai musik luar (panggil di dalam gesture user). */
export function startMusic() {
    if (S.playing) return;
    S.runId += 1;
    const myRun = S.runId;
    S.playing = true;

    if (MUSIC_SRC) {
        if (!S.audioEl) {
            S.audioEl = new Audio(MUSIC_SRC);
            S.audioEl.loop = true;
            S.audioEl.volume = 0.4;
        }
        void S.audioEl.play();
        return;
    }

    resumeAudio();
    S.step = 0;
    if (S.timer) {
        clearTimeout(S.timer);
        S.timer = null;
    }
    tick(myRun);
}

/** Hentikan musik luar (dan matikan loop yang lagi jalan). */
export function stopMusic() {
    S.playing = false;
    S.runId += 1;
    if (S.timer) {
        clearTimeout(S.timer);
        S.timer = null;
    }
    if (S.audioEl) S.audioEl.pause();
}

export function isMusicPlaying() {
    return (S.mode ?? "off") !== "off";
}

// --- Musik khusus CASTLE (dari file mp3/mp4) --------------------------------

/** Mulai lagu castle (looping). Fallback ke musik default kalau src kosong. */
export function startCastleMusic() {
    if (typeof window === "undefined") return;
    if (!CASTLE_MUSIC_SRC) {
        // gak ada file castle -> pakai musik default biar tetap ada backsound
        startMusic();
        return;
    }
    if (!S.castleEl) {
        S.castleEl = new Audio(CASTLE_MUSIC_SRC);
        S.castleEl.loop = true;
        S.castleEl.volume = 0.5;
    }
    // console.log("[music] startCastleMusic ->", CASTLE_MUSIC_SRC);
    S.castleEl.play().catch((err) => console.warn("[music] castle play blocked:", err));
}

/** Hentikan lagu castle. */
export function stopCastleMusic() {
    if (S.castleEl) S.castleEl.pause();
}

/**
 * Atur musik sesuai SCENE + status on/off. Sumber kebenaran tunggal.
 */
export function applyMusic(musicOn: boolean, scene: "overworld" | "castle") {
    const want: MusicMode = !musicOn ? "off" : scene;
    // console.log("[music] applyMusic", { musicOn, scene, from: S.mode, want });
    if (want === S.mode) return;
    stopMusic();
    stopCastleMusic();
    S.mode = want;
    if (want === "overworld") startMusic();
    else if (want === "castle") startCastleMusic();
}