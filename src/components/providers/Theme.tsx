"use client";

import { ThemeProvider as NextThemes } from "next-themes";

/** Dark is the console default; "light" applies the .light daylight-ops print. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="dark" disableTransitionOnChange>
      {children}
    </NextThemes>
  );
}
