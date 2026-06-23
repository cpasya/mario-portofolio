import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cpasya · Portfolio Petualangan",
  description:
    "Portofolio interaktif bergaya platformer 2.5D dengan Next.js, R3F, dan Rapier.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // "cover" -> konten boleh masuk area notch/home-indicator, DAN bikin
  // env(safe-area-inset-*) keisi nilai asli. Tanpa ini, safe-area = 0 di iOS
  // dan D-Pad bisa ketutup/terpotong.
  viewportFit: "cover",
  themeColor: "#5c94fc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}