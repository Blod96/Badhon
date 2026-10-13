import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#DC2626",
          hover: "#B91C1C",
          surface: "#FEF2F2",
          border: "#FECACA"
        },
        admin: {
          sidebar: "#0F172A",
          sidebarHover: "#1E293B",
          surface: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0"
        },
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8"
        },
        status: {
          urgent: "#EA580C",
          critical: "#B91C1C",
          available: "#16A34A",
          cooldown: "#64748B"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-jakarta)", "sans-serif"]
      }
    },
  },
  plugins: [],
};

export default config;
