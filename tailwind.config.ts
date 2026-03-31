import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F6F4EF",
        navy: "#1B2A4A",
        ink: "#1A1916",
        amber: "#B45C10",
        forest: "#2D5A3D"
      },
      fontFamily: {
        heading: ["var(--font-playfair)"],
        body: ["var(--font-source-sans)"]
      },
      boxShadow: {
        card: "0 10px 30px -18px rgba(27, 42, 74, 0.22)"
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.95" },
          "50%": { transform: "scale(1.35)", opacity: "0.35" }
        }
      },
      animation: {
        "pulse-ring": "pulseRing 1.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
