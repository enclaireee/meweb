import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";
import { preload } from "react-dom";
import { profile } from "@/content/profile";
import { contact, siteUrl } from "@/content/contact";
import { lightBootScript } from "@/scene/store";
import { ClientBoot } from "@/ui/ClientBoot";
import { Frame } from "@/ui/Frame/Frame";
import "./globals.css";
import "@/ui/clips.generated.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const title = `${profile.name}: Electrical Engineering, UI`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: profile.about,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title,
    description: profile.summary,
    url: "/",
    siteName: "The Night Workshop",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description: profile.summary },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#212843" },
    { media: "(prefers-color-scheme: light)", color: "#DCD6CF" },
  ],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school },
  address: { "@type": "PostalAddress", addressLocality: "Depok", addressRegion: "Jawa Barat", addressCountry: "ID" },
  email: "mailto:muhfatihzamzami@gmail.com",
  url: siteUrl,
  sameAs: contact.filter((c) => c.id !== "email").map((c) => c.href),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // the paper grain tile is on every plate, so it's the LCP image: fetch it with the fonts, not after the CSS
  preload("/textures/grain-rough.webp", { as: "image", fetchPriority: "high" });
  return (
    <html lang="en" data-light="night" className={newsreader.variable} suppressHydrationWarning>
      <head>
        {/* sets data-light before first paint: no flash of the wrong light */}
        <script dangerouslySetInnerHTML={{ __html: lightBootScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link cast">
          <span className="paper grain block px-4 py-2 text-caption italic">Skip to the plates</span>
        </a>
        {children}
        <Frame />
        <ClientBoot />
      </body>
    </html>
  );
}
