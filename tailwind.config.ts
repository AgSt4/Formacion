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
        ink: "#1E2430",
        sand: "#E6E0D3",
        muted: "#6B7280",
        success: "#2D6A4F",
        danger: "#A63A50",
        warning: "#C0841A"
      },
      fontFamily: {
        heading: ["var(--font-playfair)"],
        body: ["var(--font-source-sans)"]
      },
      boxShadow: {
        card: "0 18px 50px -28px rgba(27, 42, 74, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
