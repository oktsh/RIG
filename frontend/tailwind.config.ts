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
        // Neural theme colors
        'neural-bg': '#050505',
        'neural-surface': '#0a0a0a',
        'text-primary': '#EAEAEA',
        'text-secondary': '#666666',
        'border-subtle': '#1a1a1a',
        'border-medium': '#333333',
        'accent': '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'Courier New', 'monospace'],
      },
      cursor: {
        default: 'crosshair',
      },
      animation: {
        'bracket-expand': 'bracket-expand 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
