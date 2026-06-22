import { create } from "zustand";
import { initAudio, playPipe, playThunder, startRain, stopRain } from "@/lib/sound";
import { applyMusic } from "@/lib/music";

export type CardType = "intro" | "skill" | "project";

/** Mode cuaca background. */
export type Weather = "morning" | "night" | "rain";

/** Scene aktif: dunia luar (overworld) atau dalam castle. */
export type Scene = "overworld" | "castle";

/** Satu foto/art di galeri dalam castle. */
export type PhotoData = {
  id: string;
  /** Path file di /public, contoh "/gallery/art-1.jpg". Kosong -> placeholder. */
  src: string;
  title: string;
  caption?: string;
};

export type CardData = {
  id: string;
  type: CardType;
  title: string;
  subtitle?: string;
  body: string;
  tags?: string[];
  /** URL gambar buat slider di atas papan (opsional). Taruh file di /public. */
  images?: string[];
};

export type ControlKey = "left" | "right" | "jump" | "down";
type Controls = Record<ControlKey, boolean>;

/** Koin pas mencapai angka ini -> trigger efek petir + "FANTASTIC". */
export const FANTASTIC_AT = 29;

/**
 * Posisi X Player pas BALIK dari castle ke overworld: tepat di depan gerbang.
 * Gerbang castle ada di x≈82 (lihat CASTLE_X di Castle.tsx); 78 = sedikit di
 * kirinya biar Mario napak di depan pintu (sensor gerbang belum langsung kepicu).
 */
export const GATE_RETURN_X = 62;

type GameState = {
  /** Apakah pemain sudah menekan "Start Game". Sebelum true, input diabaikan. */
  started: boolean;
  /** Status musik latar nyala/mati (dibaca tombol sound). */
  musicOn: boolean;
  /** Mode cuaca background yang sedang aktif (morning/night/rain). */
  weather: Weather;
  /** Jumlah koin yang sudah dikumpulkan (state global, dibaca HUD). */
  coins: number;
  /**
   * Token efek "FANTASTIC". 0 = tidak aktif. Setiap trigger di-set ke nilai unik
   * (Date.now()) supaya komponen FX bisa me-restart animasinya.
   */
  fantasticKey: number;
  /** Card yang sedang terbuka di layar (null kalau tidak ada). */
  activeCard: CardData | null;
  /** Status tombol kontrol (ditulis keyboard & D-Pad, dibaca Player). */
  controls: Controls;
  /** Card proyek dari pipa terdekat (checkpoint). */
  nearPipeCard: CardData | null;
  /** Apakah pemain sedang berdiri di depan gerbang castle. */
  nearGate: boolean;
  /** Scene yang sedang dirender. */
  scene: Scene;
  /** Scene tujuan saat transisi (loading) berjalan; null kalau tidak transisi. */
  pendingScene: Scene | null;
  /** Frame foto terdekat di castle (buat hint); null kalau tidak ada. */
  nearPhoto: PhotoData | null;
  /** Foto yang sedang dibuka full di popup galeri. */
  activePhoto: PhotoData | null;
  /** Posisi X spawn Player di overworld (dipakai pas balik dari castle). */
  overworldSpawnX: number;

  startGame: () => void;
  toggleMusic: () => void;
  setWeather: (weather: Weather) => void;
  addCoin: () => void;
  resetCoins: () => void;
  clearFantastic: () => void;
  openCard: (card: CardData) => void;
  closeCard: () => void;
  setControl: (key: ControlKey, value: boolean) => void;
  setNearPipe: (card: CardData) => void;
  clearNearPipe: (id: string) => void;
  setNearGate: (value: boolean) => void;
  enterCastle: () => void;
  exitCastle: () => void;
  commitScene: () => void;
  endTransition: () => void;
  setNearPhoto: (photo: PhotoData) => void;
  clearNearPhoto: (id: string) => void;
  tryOpenPhoto: () => void;
  closePhoto: () => void;
  tryEnterPipe: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  started: false,
  musicOn: false,
  weather: "morning",
  coins: 0,
  fantasticKey: 0,
  activeCard: null,
  controls: { left: false, right: false, jump: false, down: false },
  nearPipeCard: null,
  nearGate: false,
  scene: "overworld",
  pendingScene: null,
  nearPhoto: null,
  activePhoto: null,
  overworldSpawnX: 0,

  startGame: () => {
    initAudio(); // dipanggil dalam gesture user => audio diizinkan
    set({ started: true, musicOn: true });
    applyMusic(true, get().scene); // scene awal = overworld -> musik luar
  },
  toggleMusic: () => {
    const on = !get().musicOn;
    set({ musicOn: on });
    applyMusic(on, get().scene);
  },
  setWeather: (weather) =>
    set((s) => {
      // Hujan looping: nyala pas MASUK rain, mati pas KELUAR dari rain.
      if (weather === "rain" && s.weather !== "rain") startRain();
      else if (weather !== "rain" && s.weather === "rain") stopRain();
      return { weather };
    }),
  addCoin: () =>
    set((s) => {
      const coins = s.coins + 1;
      // Pas tepat menyentuh ambang -> bunyi guntur + nyalakan efek FANTASTIC.
      if (coins === FANTASTIC_AT) {
        playThunder();
        return { coins, fantasticKey: Date.now() };
      }
      return { coins };
    }),
  resetCoins: () => set({ coins: 0 }),
  clearFantastic: () => set({ fantasticKey: 0 }),
  openCard: (card) => set({ activeCard: card }),
  closeCard: () => set({ activeCard: null }),
  setControl: (key, value) =>
    set((s) => ({ controls: { ...s.controls, [key]: value } })),
  setNearPipe: (card) => set({ nearPipeCard: card }),
  clearNearPipe: (id) =>
    set((s) => (s.nearPipeCard?.id === id ? { nearPipeCard: null } : {})),
  setNearGate: (value) => set({ nearGate: value }),
  enterCastle: () =>
    set((s) =>
      s.pendingScene
        ? {}
        : {
          pendingScene: "castle",
          nearGate: false,
          // Pas balik nanti, spawn Player tepat di depan gerbang castle.
          overworldSpawnX: GATE_RETURN_X,
        },
    ),
  exitCastle: () =>
    set((s) =>
      s.pendingScene
        ? {}
        : { pendingScene: "overworld", activePhoto: null, nearPhoto: null },
    ),
  commitScene: () => {
    const s = get();
    if (!s.pendingScene) return;
    const next = s.pendingScene;
    // Ganti track musik tepat pas scene berganti (luar <-> castle).
    applyMusic(s.musicOn, next);
    set({
      scene: next,
      // bersihin state transient supaya scene baru mulai bersih
      activeCard: null,
      nearPipeCard: null,
      nearGate: false,
      nearPhoto: null,
      activePhoto: null,
    });
  },
  endTransition: () => set({ pendingScene: null }),
  setNearPhoto: (photo) => set({ nearPhoto: photo }),
  clearNearPhoto: (id) =>
    set((s) => (s.nearPhoto?.id === id ? { nearPhoto: null } : {})),
  tryOpenPhoto: () => {
    const s = get();
    if (s.scene === "castle" && s.nearPhoto && !s.activePhoto) {
      set({ activePhoto: s.nearPhoto });
    }
  },
  closePhoto: () => set({ activePhoto: null }),
  tryEnterPipe: () => {
    const s = get();
    if (s.started && s.nearPipeCard && !s.activeCard) {
      playPipe();
      set({ activeCard: s.nearPipeCard });
    }
  },
}));