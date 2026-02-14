import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#E5E5E5",
        panel: "#000000",
        card: "#F0F0F0",
        hover: "#FFE600",
        accent: "#FFE600",
        "text-primary": "#000000",
        "text-secondary": "#404040",
        "text-tertiary": "#666666",
        "text-inverse": "#FFFFFF",
        "status-published": "#B4FF00",
        "status-draft": "#DDD",
        "status-pending": "#FFE600",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        ui: ["var(--font-ui)", "sans-serif"],
      },
      boxShadow: {
        "brutal-sm": "4px 4px 0px #000",
        "brutal-md": "6px 6px 0px #000",
        "brutal-lg": "8px 8px 0px #000",
        "brutal-xl": "10px 10px 0px #000",
      },
      borderRadius: {
        none: "0",
      },
    },
  },
  plugins: [],
} satisfies Config;
