import type { Metadata } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { ThemeProvider } from "@/components/providers/Theme";
import { Cursor } from "@/components/ui/Cursor";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display-face",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body-face",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${newsreader.variable} ${hanken.variable} antialiased`}
      >
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <ThemeToggle />
          <Cursor />
        </ThemeProvider>
      </body>
    </html>
  );
}
