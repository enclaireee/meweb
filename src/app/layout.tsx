import type { Metadata } from "next";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { Cursor } from "@/components/ui/Cursor";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-face",
  axes: ["opsz", "WONK"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-body-face",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Muhammad Fatih Zamzami — Electrical Engineer",
  description:
    "Portfolio of Muhammad Fatih Zamzami — electrical engineering student at Universitas Indonesia building across hardware and software.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable} antialiased`}
      >
        <SmoothScroll>{children}</SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
