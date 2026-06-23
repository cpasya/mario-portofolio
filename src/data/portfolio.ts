import type { CardData } from "@/store/useGameStore";

// ============================================================================
//  EDIT BAGIAN INI buat ngisi portofolio lu sendiri.
//  - boxes : kotak "?" yang disundul (perkenalan + skill)
//  - pipes : pipa hijau (checkpoint proyek / studi kasus)
//  - signs : papan petunjuk arah
//  Atur posisi lewat angka `x` (sumbu horizontal dunia).
//  Mau ada slider gambar di papan? Tambah `images` di card, contoh:
//      images: ["/shots/proj1-a.png", "/shots/proj1-b.png"]
//  (taruh filenya di folder /public). Kalau kosong -> tampil slide placeholder.
// ============================================================================

export const boxes: { x: number; card: CardData }[] = [
  {
    x: 6,
    card: {
      id: "intro",
      type: "intro",
      title: "Halo, gua Pasya!👋",
      subtitle: "Frontend / Creative Developer",
      body: "Gua suka bikin pengalaman web yang interaktif, rapih, dan nyenengin buat dipakai.\n\nTerus geser ke kanan buat ketemu skill gua di kotak berikutnya, dan proyek-proyek gua di pipa hijau!",
    },
  },
  {
    x: 8.5,
    card: {
      id: "skill-fe",
      type: "skill",
      title: "Frontend Engineering",
      body: "Bikin antarmuka yang cepat, accessible, dan enak dipandang.",
      tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    },
  },
  {
    x: 11,
    card: {
      id: "skill-3d",
      type: "skill",
      title: "3D & Motion",
      body: "Bikin web jadi hidup lewat animasi halus dan dunia 3D interaktif.",
      tags: ["React Three Fiber", "Three.js", "Framer Motion", "Rapier"],
    },
  },
  {
    x: 13.5,
    card: {
      id: "contact",
      type: "skill",
      title: "Yuk Ngobrol!",
      subtitle: "Open buat kolaborasi & kerjaan",
      body: "📧 pasya0129@gmail.com\n🌐 github.com/cpasya",
    },
  },
];

export const pipes: { x: number; card: CardData }[] = [
  {
    x: 22,
    card: {
      id: "proj-1",
      type: "project",
      title: "J.A.R.V.I.S",
      subtitle: "AI Assistant",
      body: "Asisten virtual yang bisa bantu buat nugas, nyari informasi, sampai ngobrol santai.\n\nTeknologi:",
      tags: ["Next.js", "Python", "Gemini API", "Supabase", "Replicate", "Electron"],

      images: [
        "/projects/jarvis-1.png",
      ],
    },
  },
  {
    x: 27,
    card: {
      id: "porto3d",
      type: "project",
      title: "Porto 3D",
      subtitle: "Personal Portfolio",
      body: "Portofolio pribadi dengan animasi 3D yang interaktif.\n\nTeknologi:",
      tags: ["R3F", "WebGL", "Next.js", "Tailwind CSS", "Three.js", "Rapier", "Framer Motion"],

      images: [
        "/projects/porto3d.png",
      ],
    },
  },
  {
    x: 32,
    card: {
      id: "proj-3",
      type: "project",
      title: "Keywae",
      subtitle: "Marketplace Application",
      body: "Platform marketplace yang memiliki fitur jual beli barang, lelang, hingga booking kendaraan untuk berpergian.\n\nPeran: Frontend Developer & UI Designer \nTeknologi:",
      tags: ["Laravel", "PostgreSQL", "JQuery", "Bootstrap"],
      images: [
        "/projects/keywae-1.jpeg",
        "/projects/keywae-2.jpeg"
      ]
    },
  },
  {
    x: 37,
    card: {
      id: "proj-4",
      type: "project",
      title: "Game Tic Tac Toe",
      subtitle: "AI Game",
      body: "Game tic tac toe dengan AI yang bisa bermain dengan manusia.\n\nTeknologi:",
      tags: ["HTML", "CSS", "Javascript"],
      images: [
        "/projects/game-1.png",
      ]
    },
  }
];

export const signs: { x: number; text: string }[] = [
  { x: -3, text: "← HATI-HATI JURANG" },
  { x: 2.5, text: "PORTOFOLIO MULAI DI SINI →" },
  // { x: 17, text: "Lompat & sundul kotak ↑" },
  { x: 19.5, text: "Pipa hijau = proyek, tekan ↓" },
  { x: 42, text: "Makasih udah main! ★" },
  { x: 78, text: "BUNTU, MAU KEMANA BRO.." }
];