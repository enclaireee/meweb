import type { Metadata } from "next";

// Salvaged from v1. Fonts, styles, and providers arrive with the Phase 3+ system.
export const metadata: Metadata = {
  title: "Muhammad Fatih Zamzami — Electrical Engineer",
  description:
    "Portfolio of Muhammad Fatih Zamzami — electrical engineering student at Universitas Indonesia building across hardware and software.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
