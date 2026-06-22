// ============================================================================
//  Sound efek (SFX) prosedural pakai Web Audio API (gak butuh file audio).
//  Pakai SATU AudioContext bersama dari audioCtx.ts (anti numpuk/lag).
//  SFX cuma bunyi sekali (one-shot), jadi gak mungkin nge-loop/dobel.
// ============================================================================

import { getAudioContext, resumeAudio } from "./audioCtx";

/** Panggil di dalam gesture user (klik / keydown) supaya audio diizinkan. */
export function initAudio() {
    resumeAudio();
}

type ToneOpts = {
    freq: number;
    to?: number;
    dur: number;
    type?: OscillatorType;
    gain?: number;
    delay?: number;
};

function tone({ freq, to, dur, type = "square", gain = 0.2, delay = 0 }: ToneOpts) {
    const c = getAudioContext();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to && to > 0) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
    // bersihin node setelah selesai biar gak numpuk di memori
    osc.onended = () => {
        osc.disconnect();
        g.disconnect();
    };
}

/**
 * Burst noise pendek (buat efek "crack" petir).
 * Dibuat dari buffer random, di-filter highpass biar kering & tajam.
 */
function noiseBurst(dur: number, gain: number, delay = 0) {
    const c = getAudioContext();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const frames = Math.floor(c.sampleRate * dur);
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
        // amplitudo meredup ke akhir (decay)
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(hp).connect(g).connect(c.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.03);
    src.onended = () => {
        src.disconnect();
        hp.disconnect();
        g.disconnect();
    };
}

/** Lompat: nada naik cepat. */
export function playJump() {
    tone({ freq: 380, to: 760, dur: 0.18, type: "square", gain: 0.16 });
}

/** Sundul kotak: dua nada naik ala koin. */
export function playBump() {
    tone({ freq: 988, dur: 0.08, type: "square", gain: 0.18 });
    tone({ freq: 1319, dur: 0.18, type: "square", gain: 0.18, delay: 0.08 });
}

/** Masuk pipa: efek warp turun. */
export function playPipe() {
    tone({ freq: 720, to: 120, dur: 0.45, type: "sine", gain: 0.22 });
    tone({ freq: 360, to: 90, dur: 0.45, type: "square", gain: 0.1, delay: 0.04 });
}

/** Jatuh ke jurang: meluncur turun panjang. */
export function playFall() {
    tone({ freq: 520, to: 60, dur: 0.6, type: "sawtooth", gain: 0.18 });
}

/**
 * Guntur/petir: crack tajam (noise) + sambaran cepat + rumble rendah panjang.
 * Dipakai pas efek "FANTASTIC" muncul (koin = 29).
 */
export function playThunder() {
    noiseBurst(0.18, 0.35); // crack awal
    tone({ freq: 1400, to: 180, dur: 0.16, type: "sawtooth", gain: 0.22 }); // sambaran
    noiseBurst(0.5, 0.2, 0.08); // gemuruh berisik
    tone({ freq: 110, to: 38, dur: 0.9, type: "sawtooth", gain: 0.22, delay: 0.05 }); // rumble rendah
}

/**
 * Hujan LOOPING (prosedural). Noise panjang di-loop terus + lowpass ("shhh")
 * & bandpass tipis (kesan rintik). Gemuruh sengaja dikecilin biar adem.
 * Nyala via startRain(), mati via stopRain(). Aman dari dobel (singleton).
 */
let rainNodes: {
    src: AudioBufferSourceNode;
    lp: BiquadFilterNode;
    bp: BiquadFilterNode;
    g: GainNode;
} | null = null;

export function startRain() {
    const c = getAudioContext();
    if (!c || rainNodes) return; // udah jalan -> jangan dobel

    // Buffer noise 3 detik, di-loop terus biar ga kedengeran ngulang & tahan lama.
    const dur = 3;
    const frames = Math.floor(c.sampleRate * dur);
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Lowpass = badan "shhh" hujan; bandpass tipis = kesan rintik.
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2000;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1100;
    bp.Q.value = 0.5;

    const g = c.createGain();
    // Gemuruh dikecilin (dulu 0.16 -> sekarang 0.1) + fade-in halus.
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, c.currentTime + 0.8);

    src.connect(lp).connect(bp).connect(g).connect(c.destination);
    src.start();
    rainNodes = { src, lp, bp, g };
}

export function stopRain() {
    if (!rainNodes) return;
    const c = getAudioContext();
    const nodes = rainNodes;
    rainNodes = null; // lepas referensi duluan -> startRain berikutnya aman

    const cleanup = () => {
        nodes.src.disconnect();
        nodes.lp.disconnect();
        nodes.bp.disconnect();
        nodes.g.disconnect();
    };

    if (c) {
        const t = c.currentTime;
        nodes.g.gain.cancelScheduledValues(t);
        nodes.g.gain.setValueAtTime(nodes.g.gain.value, t);
        nodes.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); // fade-out halus
        nodes.src.onended = cleanup;
        nodes.src.stop(t + 0.55);
    } else {
        try {
            nodes.src.stop();
        } catch { }
        cleanup();
    }
}