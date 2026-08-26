import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#f3efe6",
          2: "#ece6d8",
          3: "#fcfbf7",
        },
        ink: {
          DEFAULT: "#1c2430",
          soft: "#4d5968",
          faint: "#6b7380",
        },
        navy: {
          DEFAULT: "#1a3654",
          mid: "#24527a",
          pale: "#d9e3ee",
        },
        rule: "#c9bfae",
        gold: "#b08d57",
        terracotta: {
          DEFAULT: "#9c4b2f",
          pale: "#f6ebe4",
        },
        teal: {
          DEFAULT: "#215e57",
          pale: "#deece9",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-ibm-plex-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(28, 36, 48, 0.06), 0 8px 24px rgba(26, 54, 84, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
