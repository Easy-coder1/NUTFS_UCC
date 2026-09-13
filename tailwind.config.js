/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1e3a5f",
        "primary-container": "#254875",
        "on-primary": "#ffffff",
        "primary-fixed": "#e0e8f5",
        "on-primary-fixed": "#0e2038",
        secondary: "#b45309",
        "secondary-container": "#fef3c7",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#78350f",
        surface: "#f8fafc",
        "surface-dim": "#e2e8f0",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8fafc",
        "surface-container": "#f1f5f9",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#cbd5e1",
        "surface-variant": "#f1f5f9",
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        outline: "#94a3b8",
        "outline-variant": "#e2e8f0",
        background: "#f8fafc",
        "on-background": "#0f172a",
        error: "#dc2626",
        "error-container": "#fef2f2",
        "on-error": "#ffffff",
        "on-error-container": "#991b1b",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        hover: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        modal: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      }
    },
  },
  plugins: [],
}
