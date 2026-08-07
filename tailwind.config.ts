import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        obsidian: "#0C111B",
        midnight: "#1A2336",
        slate: {
          brand: "#2A3850",
          light: "#5A6B86",
        },
        pearl: "#F4F7FB",
        /** Warm luminous champagne — polished, not neon yellow */
        gold: {
          DEFAULT: "#D2C09A",
          mid: "#E4D5B4",
          light: "#F0E6D0",
          soft: "#C4B08A",
        },
        plot: {
          available: "#3CB87A",
          reserved: "#D4A04A",
          sold: "#D06A5A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glass:
          "0 8px 40px rgba(0,0,0,0.28), 0 0 0 0.5px rgba(255,255,255,0.06) inset",
        gold: "0 6px 24px rgba(210,192,154,0.28), 0 1px 0 rgba(255,255,255,0.2) inset",
        "gold-lg":
          "0 10px 36px rgba(210,192,154,0.35), 0 1px 0 rgba(255,255,255,0.22) inset",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #C4B08A 0%, #D2C09A 35%, #E4D5B4 65%, #D2C09A 100%)",
        "ambient-glow":
          "radial-gradient(ellipse at top right, rgba(210,192,154,0.14), transparent 55%), radial-gradient(ellipse at bottom left, rgba(100,140,190,0.10), transparent 50%)",
        "hero-overlay":
          "linear-gradient(90deg, rgba(12,17,27,0.82) 0%, rgba(12,17,27,0.4) 48%, rgba(12,17,27,0.12) 100%)",
      },
      borderRadius: {
        card: "18px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease both",
        "pulse-dot": "pulseDot 2.2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.85)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
