import type { PhotoData } from "@/store/useGameStore";

// Tiap entri = 1 frame foto. Taruh file di /public/gallery/ lalu isi `src`.
// `x` = posisi horizontal di koridor (0..56). Kosongin src -> placeholder.
export const frames: { x: number; photo: PhotoData }[] = [
    { x: 8, photo: { id: "art-1", src: "/gallery/art-1.jpeg", title: "My First Team Ever!", caption: "Tim kerja pertama dalam hidup gua dalam menghadapi projek besar yang tak kunjung usai (Keywae). Manis dan pahitnya pekerjaan telah kita lalui bersama. #atBajawaBintaro2023" } },
    { x: 16, photo: { id: "art-2", src: "/gallery/art-2.jpeg", title: "Last Warrior Standing.", caption: "The real warrior is the one who never give up, even though facing the biggest challenge. Perkopian dalam rangka melepas pertempuran terakhir. The story might end, but the spirit never dies. " } },
    { x: 24, photo: { id: "art-3", src: "/gallery/art-3.jpg", title: "Karya 3", caption: "Tulis cerita di balik karya ini." } },
    { x: 32, photo: { id: "art-4", src: "/gallery/art-4.jpeg", title: "Karya 4", caption: "Tulis cerita di balik karya ini." } },
    { x: 40, photo: { id: "art-5", src: "/gallery/art-5.jpeg", title: "Karya 5", caption: "Tulis cerita di balik karya ini." } },
];