import * as THREE from "three";

// ============================================================================
//  Procedural sprite generator.
//  Sesuai konsep 2.5D: tiap fungsi menggambar gambar 2D ke <canvas>, lalu
//  dijadikan tekstur (CanvasTexture) yang ditempel ke plane geometry di R3F.
//  Mau pakai PNG/WebP asli? Tinggal ganti: pakai useTexture/THREE.TextureLoader
//  buat load file dari /public dan oper ke material plane-nya.
// ============================================================================

type Ctx = CanvasRenderingContext2D;

function cv(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export function toTexture(canvas: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(canvas);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.LinearFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function circle(x: Ctx, cx: number, cy: number, r: number) {
  x.beginPath();
  x.arc(cx, cy, r, 0, Math.PI * 2);
  x.closePath();
  x.fill();
}

function rrPath(x: Ctx, X: number, Y: number, W: number, H: number, r: number) {
  const rr = Math.min(r, W / 2, H / 2);
  x.beginPath();
  x.moveTo(X + rr, Y);
  x.arcTo(X + W, Y, X + W, Y + H, rr);
  x.arcTo(X + W, Y + H, X, Y + H, rr);
  x.arcTo(X, Y + H, X, Y, rr);
  x.arcTo(X, Y, X + W, Y, rr);
  x.closePath();
}

function rrFill(x: Ctx, X: number, Y: number, W: number, H: number, r: number, color: string) {
  x.fillStyle = color;
  rrPath(x, X, Y, W, H, r);
  x.fill();
}

function wrapText(x: Ctx, text: string, cx: number, cy: number, maxW: number, lh: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (x.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = t;
    }
  }
  if (cur) lines.push(cur);
  const startY = cy - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, i) => x.fillText(ln, cx, startY + i * lh));
}

/** Karakter hero. frame: 0 = diam, 1 & 2 = animasi jalan. Menghadap kanan. */
export function drawPlayer(frame: number) {
  const c = cv(96, 128);
  const x = c.getContext("2d")!;
  x.imageSmoothingEnabled = false;
  x.clearRect(0, 0, 96, 128);

  const RED = "#e23b2e";
  const SKIN = "#ffc89e";
  const NOSE = "#eda979";
  const BLUE = "#2a6fdb";
  const BLUED = "#1c4fa0";
  const BROWN = "#5b3a1a";
  const DARK = "#2b1d10";
  const YEL = "#f7d51d";
  const EYE = "#28415e";

  let lA = 28;
  let lB = 52;
  if (frame === 1) {
    lA = 22;
    lB = 52;
  } else if (frame === 2) {
    lA = 32;
    lB = 58;
  }
  // shoes
  rrFill(x, lA, 104, 20, 16, 5, BROWN);
  rrFill(x, lB, 104, 20, 16, 5, BROWN);
  x.fillStyle = DARK;
  x.fillRect(lA, 116, 20, 5);
  x.fillRect(lB, 116, 20, 5);
  // overalls
  rrFill(x, 28, 64, 40, 46, 8, BLUE);
  x.fillStyle = BLUED;
  x.fillRect(28, 100, 40, 8);
  x.fillStyle = BLUE;
  x.fillRect(33, 50, 8, 20);
  x.fillRect(55, 50, 8, 20);
  x.fillStyle = YEL;
  circle(x, 37, 72, 3.5);
  circle(x, 59, 72, 3.5);
  // arms
  rrFill(x, 16, 58, 14, 30, 6, RED);
  rrFill(x, 66, 58, 14, 30, 6, RED);
  x.fillStyle = SKIN;
  circle(x, 23, 90, 7);
  circle(x, 73, 90, 7);
  // chest
  x.fillStyle = RED;
  x.fillRect(40, 52, 16, 16);
  // head
  rrFill(x, 30, 22, 36, 34, 12, SKIN);
  x.fillStyle = SKIN;
  circle(x, 31, 42, 5);
  // hat
  rrFill(x, 24, 12, 46, 16, 8, RED);
  x.fillStyle = RED;
  x.fillRect(56, 18, 24, 9);
  // hair / sideburn
  x.fillStyle = DARK;
  x.fillRect(30, 38, 6, 14);
  x.fillRect(30, 36, 12, 4);
  // eye
  x.fillStyle = EYE;
  x.fillRect(50, 36, 6, 11);
  // mustache
  rrFill(x, 40, 50, 26, 8, 3, DARK);
  // nose
  x.fillStyle = NOSE;
  circle(x, 60, 47, 5);
  return c;
}

/** Kotak koin "?". used = true menjadi blok terpakai. */
export function drawBox(used: boolean) {
  const c = cv(96, 96);
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, 96, 96);
  const base = used ? "#b07b3a" : "#f4b53b";
  const edge = used ? "#7c4f1d" : "#c87e1b";
  rrFill(x, 4, 4, 88, 88, 10, base);
  x.lineWidth = 6;
  x.strokeStyle = edge;
  rrPath(x, 9, 9, 78, 78, 7);
  x.stroke();
  x.fillStyle = edge;
  [
    [18, 18],
    [78, 18],
    [18, 78],
    [78, 78],
  ].forEach(([px, py]) => circle(x, px, py, 4));
  if (!used) {
    x.fillStyle = "#ffffff";
    x.font = "bold 58px Arial";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText("?", 48, 52);
  } else {
    x.fillStyle = edge;
    x.fillRect(28, 44, 40, 8);
  }
  return c;
}

/** Pipa hijau ala Mario. */
export function drawPipe() {
  const c = cv(160, 200);
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, 160, 200);
  const g = "#39b54a";
  const gd = "#1f7a30";
  const gl = "#7ed957";
  // body
  x.fillStyle = g;
  x.fillRect(30, 50, 100, 150);
  x.fillStyle = gl;
  x.fillRect(42, 50, 14, 150);
  x.fillStyle = gd;
  x.fillRect(112, 50, 18, 150);
  // lip
  rrFill(x, 10, 10, 140, 46, 8, g);
  x.fillStyle = gl;
  x.fillRect(24, 16, 16, 38);
  x.fillStyle = gd;
  x.fillRect(120, 16, 22, 38);
  x.lineWidth = 4;
  x.strokeStyle = gd;
  x.strokeRect(12, 12, 136, 42);
  return c;
}

/** Papan petunjuk dengan teks. */
export function drawSign(text: string) {
  const c = cv(320, 160);
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, 320, 160);
  x.fillStyle = "#6b4a23";
  x.fillRect(62, 118, 14, 42);
  x.fillRect(244, 118, 14, 42);
  rrFill(x, 20, 18, 280, 110, 14, "#c98a3c");
  x.lineWidth = 8;
  x.strokeStyle = "#7c5320";
  rrPath(x, 25, 23, 270, 100, 10);
  x.stroke();
  x.fillStyle = "#fff7e6";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = "bold 30px Arial";
  wrapText(x, text, 160, 73, 250, 34);
  return c;
}

/** Awan dekoratif. */
export function drawCloud() {
  const c = cv(160, 90);
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, 160, 90);
  x.fillStyle = "#ffffff";
  (
    [
      [45, 55, 28],
      [80, 44, 36],
      [115, 55, 28],
      [65, 60, 24],
      [100, 60, 24],
    ] as const
  ).forEach(([cx, cy, r]) => circle(x, cx, cy, r));
  x.fillRect(42, 58, 76, 24);
  return c;
}

/** Permukaan BATA (tanpa rumput): gradasi orange->kuning + pola bata. Diulang horizontal, di-stretch vertikal. */
export function drawGround() {
  const W = 64;
  const H = 128;
  const c = cv(W, H);
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, W, H);
  // Gradasi orange (atas, dekat rumput) -> kuning (bawah), span seluruh tinggi bata.
  const dirt = x.createLinearGradient(0, 0, 0, H);
  dirt.addColorStop(0, "#f0912f"); // orange
  dirt.addColorStop(0.55, "#f4b53b"); // amber transisi
  dirt.addColorStop(1, "#f7d24a"); // kuning
  x.fillStyle = dirt;
  x.fillRect(0, 0, W, H);
  // Pola bata offset (selang-seling).
  x.strokeStyle = "#c8761a";
  x.lineWidth = 2;
  const row = 26;
  let r = 0;
  for (let y = 0; y <= H; y += row) {
    // garis horizontal antar baris bata
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(W, y);
    x.stroke();
    // seam vertikal: baris genap di tengah, baris ganjil di tepi (offset)
    x.beginPath();
    if (r % 2 === 0) {
      x.moveTo(W / 2, y);
      x.lineTo(W / 2, y + row);
    } else {
      x.moveTo(0, y);
      x.lineTo(0, y + row);
      x.moveTo(W, y);
      x.lineTo(W, y + row);
    }
    x.stroke();
    r++;
  }
  return c;
}

/** Rumput tipis di permukaan (diulang horizontal). */
export function drawGrass() {
  const W = 64;
  const H = 24;
  const c = cv(W, H);
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, W, H);
  x.fillStyle = "#5cb43a";
  x.fillRect(0, 0, W, H);
  x.fillStyle = "#3f8f25"; // bayangan bawah rumput
  x.fillRect(0, 17, W, 7);
  x.fillStyle = "#6ec84a"; // highlight rumput
  for (let i = 0; i < W; i += 8) x.fillRect(i, 0, 3, 6);
  return c;
}

/** Castle ala Mario (dipakai sebagai background) dengan gerbang TERTUTUP di tengah. */
export function drawCastle() {
  const W = 400;
  const H = 320;
  const c = cv(W, H);
  const x = c.getContext("2d")!;
  x.imageSmoothingEnabled = false;
  x.clearRect(0, 0, W, H);

  const STONE = "#8b8f96";
  const STONE_D = "#5f636b";
  const STONE_L = "#a9adb4";
  const MORTAR = "#474a50";
  const DOOR = "#15181f";
  const DOOR_BAR = "#2b2f38";
  const FLAG = "#e23b2e";
  const POLE = "#d7dbe2";

  // Gerigi benteng (crenellation) sepanjang sisi atas.
  const crenel = (bx: number, by: number, bw: number, t: number) => {
    x.fillStyle = STONE;
    let cx = bx;
    let on = true;
    while (cx < bx + bw - 0.5) {
      const seg = Math.min(t, bx + bw - cx);
      if (on) x.fillRect(cx, by, seg, t);
      cx += seg;
      on = !on;
    }
  };

  // Blok batu (badan / menara) + sisi terang-gelap + garis bata.
  const block = (bx: number, by: number, bw: number, bh: number) => {
    x.fillStyle = STONE;
    x.fillRect(bx, by, bw, bh);
    x.fillStyle = STONE_L;
    x.fillRect(bx, by, 6, bh);
    x.fillStyle = STONE_D;
    x.fillRect(bx + bw - 6, by, 6, bh);
    x.strokeStyle = MORTAR;
    x.lineWidth = 2;
    for (let yy = by + 22; yy < by + bh; yy += 22) {
      x.beginPath();
      x.moveTo(bx, yy);
      x.lineTo(bx + bw, yy);
      x.stroke();
    }
  };

  // Badan utama.
  block(50, 150, 300, 170);
  crenel(50, 132, 300, 18);

  // Menara kiri & kanan.
  block(44, 96, 64, 224);
  crenel(44, 80, 64, 16);
  block(292, 96, 64, 224);
  crenel(292, 80, 64, 16);

  // Menara tengah (paling tinggi).
  block(158, 44, 84, 276);
  crenel(158, 26, 84, 18);

  // Jendela gelap.
  x.fillStyle = DOOR;
  x.fillRect(64, 132, 22, 30);
  x.fillRect(312, 132, 22, 30);
  x.fillRect(189, 78, 22, 28);

  // Bendera di puncak menara tengah.
  x.fillStyle = POLE;
  x.fillRect(199, 6, 3, 24);
  x.fillStyle = FLAG;
  x.beginPath();
  x.moveTo(202, 8);
  x.lineTo(230, 15);
  x.lineTo(202, 22);
  x.closePath();
  x.fill();

  // GERBANG TERTUTUP (lengkung di tengah bawah).
  const gx = 168;
  const gw = 64;
  const archCenterY = 248; // garis pegas (spring line) lengkungan
  x.fillStyle = DOOR;
  x.beginPath();
  x.moveTo(gx, H);
  x.lineTo(gx, archCenterY);
  x.arc(gx + gw / 2, archCenterY, gw / 2, Math.PI, 0, true); // setengah lingkaran atas
  x.lineTo(gx + gw, H);
  x.closePath();
  x.fill();
  // Bingkai batu di sekeliling lengkungan.
  x.strokeStyle = STONE_L;
  x.lineWidth = 5;
  x.stroke();
  // Papan pintu vertikal + palang horizontal (kesan ketutup).
  x.strokeStyle = DOOR_BAR;
  x.lineWidth = 3;
  const gTop = archCenterY - gw / 2 + 8;
  for (let i = 1; i < 4; i++) {
    const px = gx + (gw / 4) * i;
    x.beginPath();
    x.moveTo(px, gTop);
    x.lineTo(px, H - 4);
    x.stroke();
  }
  for (let i = 1; i <= 3; i++) {
    const py = gTop + i * 26;
    x.beginPath();
    x.moveTo(gx + 5, py);
    x.lineTo(gx + gw - 5, py);
    x.stroke();
  }

  return c;
}

/** "Jurang": gradasi vertikal dari amber (#c8761a) di permukaan -> nyaris hitam ke bawah. */
export function drawChasm() {
  const H = 512;
  const c = cv(8, H);
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#f7b86a"); // permukaan (atas) - orange muda
  g.addColorStop(0.05, "#c8761a"); // orange
  g.addColorStop(0.12, "#5a3310");
  g.addColorStop(0.2, "#1a0f06");
  g.addColorStop(0.3, "#000000"); // hitam (mulai dominan)
  g.addColorStop(1, "#000000"); // hitam sampai paling bawah
  x.fillStyle = g;
  x.fillRect(0, 0, 8, H);
  return c;
}

/** Batu castle (gelap) buat lantai & langit-langit. Tileable horizontal. */
export function drawStone() {
  const W = 128;
  const H = 128;
  const c = cv(W, H);
  const x = c.getContext("2d")!;
  x.fillStyle = "#2f2f38"; // mortar gelap (celah antar blok)
  x.fillRect(0, 0, W, H);
  const bw = 64;
  const bh = 32;
  for (let row = 0, y = 0; y < H; y += bh, row++) {
    const off = row % 2 === 0 ? 0 : -bw / 2; // baris ganjil geser (offset bata)
    for (let bx = off; bx < W; bx += bw) {
      const dark = Math.floor((bx + y) / 17) % 2 === 0; // variasi tone
      x.fillStyle = dark ? "#3c3c47" : "#45454f";
      x.fillRect(bx + 2, y + 2, bw - 4, bh - 4);
      x.fillStyle = "#52525f"; // highlight atas
      x.fillRect(bx + 2, y + 2, bw - 4, 4);
      x.fillStyle = "#23232b"; // shadow bawah
      x.fillRect(bx + 2, y + bh - 6, bw - 4, 4);
    }
  }
  return c;
}

/** Bingkai foto dekoratif buat dinding castle. label = judul singkat di tengah. */
export function drawFrame(label: string, withPlaceholder = true) {
  const W = 256;
  const H = 256;
  const c = cv(W, H);
  const x = c.getContext("2d")!;
  x.clearRect(0, 0, W, H);
  // bingkai emas berlapis
  rrFill(x, 6, 6, W - 12, H - 12, 16, "#caa24a");
  rrFill(x, 14, 14, W - 28, H - 28, 12, "#8a6f2c");
  rrFill(x, 20, 20, W - 40, H - 40, 10, "#caa24a");
  // mat dalam + "kanvas" gelap (foto ketutup, baru kebuka di popup)
  rrFill(x, 30, 30, W - 60, H - 60, 8, "#161320");
  const g = x.createLinearGradient(0, 36, 0, H - 36);
  g.addColorStop(0, "#2a2740");
  g.addColorStop(1, "#120f19");
  x.fillStyle = g;
  x.fillRect(40, 40, W - 80, H - 80);
  // baut pojok
  x.fillStyle = "#6f561d";
  ([[24, 24], [W - 24, 24], [24, H - 24], [W - 24, H - 24]] as const).forEach(
    ([px, py]) => circle(x, px, py, 5),
  );
  // ikon + label PLACEHOLDER -> cuma tampil kalau foto BELUM ada. Begitu foto
  // udah ke-load (withPlaceholder=false), bagian ini dilewatin biar gak nembus
  // di belakang foto.
  if (withPlaceholder) {
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = "#d9d2ff";
    x.font = "44px Arial";
    x.fillText("\ud83d\uddbc\ufe0f", W / 2, H / 2 - 18);
    x.fillStyle = "#f0ead6";
    x.font = "bold 22px Arial";
    x.fillText(label, W / 2, H / 2 + 34);
  }
  return c;
}