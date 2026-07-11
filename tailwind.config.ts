import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Mandarina: color primario de acción (CTAs, precios, acentos)
        aji: {
          50: "#fff5ef",
          100: "#ffe8da",
          200: "#ffceb0",
          300: "#ffa778",
          400: "#ff7a3c",
          500: "#f95d14",
          600: "#e2440a",
          700: "#bb340b",
          800: "#942b10",
          900: "#78260f",
        },
        // Verde lima: identidad de marca (el "lima" del logo, estados frescos)
        lima: {
          50: "#f4fae8",
          100: "#e5f4cc",
          200: "#cce99f",
          300: "#aad868",
          400: "#8bc23c",
          500: "#6ca427",
          600: "#53821c",
          700: "#40641a",
          800: "#35501a",
          900: "#2d441a",
        },
        // Crema: fondos cálidos
        crema: {
          50: "#fbf8f2",
          100: "#f6efe2",
          200: "#ede1cb",
        },
        // Tinta: textos (más cálida que el negro puro)
        tinta: {
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -10px rgba(28, 25, 23, 0.12)",
        cta: "0 4px 14px -4px rgba(226, 68, 10, 0.45)",
        "cta-hover": "0 10px 26px -6px rgba(226, 68, 10, 0.5)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
