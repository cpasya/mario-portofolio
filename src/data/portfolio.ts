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
      title: "Proyek Satu",
      subtitle: "Studi kasus",
      body: "Deskripsi singkat proyek di sini.\n\nPeran: …\nTeknologi: …\nHasil: …",
      tags: ["Next.js", "UI/UX"],
    },
  },
  {
    x: 27,
    card: {
      id: "proj-2",
      type: "project",
      title: "Proyek Dua",
      subtitle: "Studi kasus",
      body: "Deskripsi singkat proyek di sini.\n\nPeran: …\nTeknologi: …\nHasil: …",
      tags: ["R3F", "WebGL"],
    },
  },
  {
    x: 32,
    card: {
      id: "proj-3",
      type: "project",
      title: "Proyek Tiga",
      subtitle: "Studi kasus",
      body: "Deskripsi singkat proyek di sini.\n\nPeran: …\nTeknologi: …\nHasil: …",
      tags: ["Dashboard", "Data Viz"],
    },
  },
  {
    x: 37,
    card: {
      id: "proj-4",
      type: "project",
      title: "Proyek Empat",
      subtitle: "Studi kasus",
      body: "Deskripsi singkat proyek di sini.\n\nPeran: …\nTeknologi: …\nHasil: …",
      tags: ["Dashboard", "Data Viz"],
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