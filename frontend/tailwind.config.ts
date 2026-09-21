import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dfeaff",
          200: "#c5d8ff",
          300: "#a2bfff",
          400: "#7d9dfc",
          500: "#5d7df5",
          600: "#4a63e8",
          700: "#3d4fcc",
          800: "#3343a3",
          900: "#2e3c81",
          950: "#1b2450",
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f4",
          200: "#dfe3ea",
          300: "#c7cdd9",
          400: "#a3acbe",
          500: "#7c879f",
          600: "#5b657c",
          700: "#434a5e",
          800: "#2b3040",
          900: "#1a1e2b",
          950: "#0f121c",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.05), 0 1px 3px rgba(16,24,40,.06)",
        raised: "0 8px 24px rgba(16,24,40,.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up .45s ease-out both",
        "fade-in": "fade-in .4s ease-out both",
        "scale-in": "scale-in .3s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
