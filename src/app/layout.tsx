import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { ThemeProvider } from "@/components/providers/Theme";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans-face",
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Muhammad Fatih Zamzami — Electrical Engineer",
  description:
    "Portfolio of Muhammad Fatih Zamzami — electrical engineering student at Universitas Indonesia building across hardware and software.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={`${plexSans.variable} ${plexMono.variable} antialiased`}>
          {/* pre-paint: lets CSS know JS is available (Reveal's hidden state) */}
          <script
            dangerouslySetInnerHTML={{
              __html: `document.documentElement.classList.add("js")`,
            }}
          />
          <ThemeProvider>
            <a
              href="#main"
              className="label fixed top-s2 left-s2 z-50 -translate-y-s7 border border-accent bg-bg px-s2 py-s1 text-accent transition-transform dur-fast focus:translate-y-0"
            >
              SKIP TO CONTENT
            </a>
            <Nav />
            <main id="main" className="mx-auto max-w-console px-gutter">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
