import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { Grain } from "@/components/ui/Grain";
import { Motion } from "@/components/motion/Motion";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Curtain } from "@/components/motion/Curtain";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// One family for the whole site. The width axis it also has is NOT loaded here
// — putting it on the primary font measured +0.396s LCP, four times the kill
// condition. The greeting gets it from a 4.7 KB eleven-glyph subset instead
// (see globals.css and scripts/build-greeting-font.sh).
const text = Archivo({
  subsets: ["latin"],
  variable: "--font-text-face",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fatih Zamzami — Electrical engineer",
    template: "%s — Fatih Zamzami",
  },
  description:
    "Muhammad Fatih Zamzami builds control systems and the software around them — brain–computer interfaces, OT monitoring, embedded hardware, and the web.",
  openGraph: {
    type: "website",
    siteName: "Fatih Zamzami",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <html lang="en" className={text.variable} suppressHydrationWarning>
        <head>
          {/* 4.7 KB, and the LCP element depends on it. Discovered through CSS
              it arrived late enough to cost 0.143s; preloaded it is in flight
              with the stylesheet. */}
          <link
            rel="preload"
            href="/fonts/archivo-greeting.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          {/* Runs before first paint: stored choice, else system preference,
              else dark. Without this the page paints the canonical dark
              theme and then flips, which is worse than no light mode. */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}d.dataset.theme=t;" +
                // Motion is opt-in and decided before first paint: reduced
                // motion, a low-memory device, or data-saver never get the
                // hidden start states at all, so nothing can be left stuck.
                "var lowPower=(navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.connection&&navigator.connection.saveData);" +
                "if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!lowPower){d.dataset.motion=''}}catch(e){}",
            }}
          />
        </head>
        <body className="antialiased">
          <a
            href="#main"
            className="meta fixed top-3 left-3 z-50 -translate-y-24 bg-accent px-3 py-2 text-accent-ink transition-transform duration-(--dur-micro) focus:translate-y-0"
          >
            Skip to content
          </a>
          <Curtain />
          <SmoothScroll />
          <Motion modal={modal}>
            <Grain />
            <Nav />
            <main id="main">{children}</main>
            <Footer />
          </Motion>
          <Analytics />
          <SpeedInsights />
        </body>
    </html>
  );
}
