import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Semantic tokens — all driven by CSS vars in app/globals.css */
        background: "var(--bg)",
        chrome: "var(--chrome)",
        surface: "var(--surface)",
        surface2: "var(--surface2)",
        border: "var(--border)",
        line: "var(--line)",
        "border-soft": "var(--soft)",
        "accent-tint": "var(--accent-tint)",
        "off-white": "var(--ink)",
        ink: "var(--ink)",
        "text-2": "var(--text2)",
        "gray-light": "var(--gray)",
        gray: "var(--muted)",
        dim: "var(--dim)",

        /* Paper — the VPR document surface */
        paper: "var(--paper)",
        "paper-ink": "var(--paper-ink)",
        "paper-muted": "var(--paper-muted)",
        "paper-line": "var(--paper-line)",

        /* Accent — rgb channel vars enable /opacity modifier support */
        gold: "rgb(var(--accent-rgb) / <alpha-value>)",
        "gold-light": "var(--accent-hi)",
        "gold-dim": "var(--accent-dim)",
        "border-gold": "var(--border-gold)",

        /* Status */
        green: "rgb(var(--green-rgb) / <alpha-value>)",
        amber: "rgb(var(--amber-rgb) / <alpha-value>)",
        red: "rgb(var(--red-rgb) / <alpha-value>)",
        blue: "rgb(var(--blue-rgb) / <alpha-value>)",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
        display: ["var(--font-cg)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
