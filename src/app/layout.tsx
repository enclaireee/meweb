import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { ThemeProvider } from "@/components/providers/Theme";
import { Cursor } from "@/components/ui/Cursor";
import { NavRail } from "@/components/ui/NavRail";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display-face",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
  weight: ["400", "500", "600"],
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
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${playfair.variable} ${inter.variable} antialiased`}
        >
          <ThemeProvider>
            <SmoothScroll>{children}</SmoothScroll>
            <NavRail />
            <ThemeToggle />
            <Cursor />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
