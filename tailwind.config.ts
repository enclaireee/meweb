import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        poppins: ["var(--font-poppins)", "sans-serif"], 
        mono: ["var(--font-geist-mono)"],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        superbold: "900",
      },

      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dark: {
          100: '#fafafa',
          200: '#3f3f46',
          300: '#18181a',
          400: '#18181b',
          500: '#09090b',
        },
        light: {
          100: "#ffe169",
          200: "#fad643",
          300: "#edc531",
          400: "#dbb42c",
      },
      },
      backgroundImage: {
        fototim1: "url('/assets/fototim1.jpeg')",
        fototim2: "url('/assets/fototim2.jpeg')",
        fototim3: "url('/assets/fototim3.jpeg')",
      },
      zIndex: {
        "60" : "60",
        "70" : "70",
        "80" : "80",
        "90" : "90",
        '100': '100',
      }
    },
  },
  plugins: [],
} satisfies Config;