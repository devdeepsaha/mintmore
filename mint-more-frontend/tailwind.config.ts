import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────────────────────
      colors: {
        // Brand & Action
        primary: {
          DEFAULT: "#111111",
          active: "#242424",
        },
        "brand-accent": "#3b82f6",

        // Badge Pastels
        badge: {
          orange: "#fb923c",
          pink: "#ec4899",
          violet: "#8b5cf6",
          emerald: "#34d399",
        },

        // Surfaces
        canvas: "#ffffff",
        "surface-soft": "#f8f9fa",
        "surface-card": "#f5f5f5",
        "surface-strong": "#e5e7eb",
        "surface-dark": "#101010",
        "surface-dark-elevated": "#1a1a1a",

        // Borders
        hairline: "#e5e7eb",
        "hairline-soft": "#f3f4f6",

        // Text
        ink: "#111111",
        body: "#374151",
        muted: "#6b7280",
        "muted-soft": "#898989",
        "on-primary": "#ffffff",
        "on-dark": "#ffffff",
        "on-dark-soft": "#a1a1aa",

        // Semantic
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
      },

      // ─── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        // Cal Sans substitute: Inter 600 with tight tracking
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Body / UI
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // Code
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },

      fontSize: {
        // Display scale (Cal Sans / display role)
        "display-xl": ["64px", { lineHeight: "1.05", letterSpacing: "-2px", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-1.5px", fontWeight: "600" }],
        "display-md": ["36px", { lineHeight: "1.15", letterSpacing: "-1px", fontWeight: "600" }],
        "display-sm": ["28px", { lineHeight: "1.2", letterSpacing: "-0.5px", fontWeight: "600" }],
        // Title scale (Inter)
        "title-lg": ["22px", { lineHeight: "1.3", letterSpacing: "-0.3px", fontWeight: "600" }],
        "title-md": ["18px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "600" }],
        "title-sm": ["16px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "600" }],
        // Body
        "body-md": ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
        // UI
        caption: ["13px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "500" }],
        button: ["14px", { lineHeight: "1.0", letterSpacing: "0", fontWeight: "600" }],
        "nav-link": ["14px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "500" }],
        code: ["14px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "400" }],
      },

      // ─── Spacing ────────────────────────────────────────────────────────────
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
      },

      // ─── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "9999px",
        full: "9999px",
      },

      // ─── Box Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        subtle: "0 1px 2px rgba(0,0,0,0.05)",
        card: "0 4px 12px rgba(0,0,0,0.08)",
        "nav-pill": "0 1px 3px rgba(0,0,0,0.10)",
      },

      // ─── Max Width ──────────────────────────────────────────────────────────
      maxWidth: {
        content: "1200px",
      },

      // ─── Grid Template Columns ──────────────────────────────────────────────
      gridTemplateColumns: {
        "hero": "7fr 5fr",
        "feature-3": "repeat(3, 1fr)",
        "feature-2": "repeat(2, 1fr)",
        "pricing-4": "repeat(4, 1fr)",
        "pricing-2": "repeat(2, 1fr)",
        "footer-4": "repeat(4, 1fr)",
      },
    },
  },
  plugins: [],
};

export default config;