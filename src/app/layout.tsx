import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { person, site } from "@/content/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title: site.title,
    description: site.description,
    url: "/",
    siteName: "Paper River",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#0A0D14",
  colorScheme: "dark",
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  email: `mailto:${person.email}`,
  url: site.url,
  jobTitle: "Electrical engineering student",
  affiliation: { "@type": "CollegeOrUniversity", name: "Universitas Indonesia" },
  address: { "@type": "PostalAddress", addressLocality: "Depok", addressRegion: "Jawa Barat", addressCountry: "ID" },
  knowsAbout: ["Control systems", "SCADA", "Time-series forecasting", "Next.js", "Python"],
};

// Runs before paint: marks JS on, and restores the day/night switch (DayToggle).
const boot = `document.documentElement.classList.add('js');try{if(localStorage.getItem('time')==='day')document.documentElement.dataset.time='day'}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
