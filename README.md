# \ud83c\udf44 cpasya \u2014 Portfolio Petualangan (2.5D Platformer)

Portofolio interaktif bergaya **Mario Bros** yang dibangun dengan Next.js (App Router) + React Three Fiber + Rapier. Pemain mengontrol karakter, menyundul kotak `?` untuk membuka kartu perkenalan/skill, dan masuk ke pipa hijau untuk melihat proyek.

## Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Framework | **Next.js 14 (App Router)** + **TypeScript** |
| 3D / Canvas | **React Three Fiber** + **three.js** |
| Physics | **@react-three/rapier** (gravitasi, lompatan, benturan) |
| State global | **Zustand** (koin, kartu aktif, kontrol) |
| UI Overlay | **Tailwind CSS** |
| Animasi UI | **Framer Motion** (transisi kartu) |

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Kontrol

- **Desktop:** `\u2190` / `\u2192` (atau A/D) untuk jalan, `Spasi` / `\u2191` / `W` untuk lompat, `\u2193` untuk masuk pipa saat berada di dekatnya.
- **Mobile:** Virtual D-Pad transparan otomatis muncul di layar sentuh.

## Mekanik

1. **Pergerakan** \u2014 `RigidBody` dinamis (Rapier), kontrol keyboard, animasi sprite jalan mengikuti arah.
2. **Sundul Box** \u2014 menyentuh bagian bawah kotak `?` dari bawah memicu animasi memantul, menambah koin (Zustand), dan memunculkan kartu (Framer Motion).
3. **Papan Petunjuk** \u2014 plane bertekstur sebagai pemandu arah.
4. **Checkpoint Pipa** \u2014 sensor collider tak terlihat; tekan `\u2193` untuk membuka kartu proyek.
5. **Kamera Ortografik** \u2014 mengikuti karakter di sumbu X secara mulus, tanpa distorsi perspektif (feel 2D retro).
6. **Responsif** \u2014 canvas `100vw/100vh`, kartu `max-w-md`, D-Pad khusus mobile.

## Mengganti Konten Portofolio

Semua teks (perkenalan, skill, proyek, papan petunjuk) ada di:

```
src/data/portfolio.ts
```

Ubah `boxes`, `pipes`, dan `signs` sesuai datamu. Atur posisi horizontal lewat angka `x`.

## Mengganti Sprite jadi PNG/WebP Asli

Saat ini sprite digambar secara prosedural di `src/lib/sprites.ts` (canvas \u2192 `CanvasTexture` \u2192 ditempel ke plane). Untuk memakai gambar asli:

1. Taruh file di folder `public/` (mis. `public/player.png`).
2. Load dengan `new THREE.TextureLoader().load("/player.png")` atau `useTexture` dari drei.
3. Pasang hasilnya ke `map` pada `meshBasicMaterial` komponen terkait (`Player`, `Box`, `Pipe`, `Sign`).

## Struktur Proyek

```
src/
  app/            # App Router (layout, page, globals.css)
  components/     # Game world: Player, Box, Pipe, Sign, Ground, Clouds, CameraRig
    ui/           # Overlay HTML: HUD, Card, DPad, Intro
  hooks/          # useKeyboard, useIsMobile
  store/          # Zustand store
  data/           # Konten portofolio (EDIT DI SINI)
  lib/            # Generator sprite/tekstur prosedural
```
