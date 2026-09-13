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
        primary: "#00288e",
        "primary-container": "#1e40af",
        "on-primary": "#ffffff",
        "primary-fixed": "#dde1ff",
        "on-primary-fixed": "#001453",
        "on-primary-fixed-variant": "#173bab",
        secondary: "#785a00",
        "secondary-container": "#fdc425",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#6d5200",
        "secondary-fixed": "#ffdf9a",
        "secondary-fixed-dim": "#f7be1d",
        surface: "#f8f9fa",
        "surface-dim": "#d9dadb",
        "surface-bright": "#f8f9fa",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface-variant": "#e1e3e4",
        "on-surface": "#191c1d",
        "on-surface-variant": "#444653",
        outline: "#757684",
        "outline-variant": "#c4c5d5",
        background: "#f8f9fa",
        "on-background": "#191c1d",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
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
        soft: "0 4px 20px rgba(0, 0, 0, 0.05)",
        card: "0 4px 30px rgba(0, 0, 0, 0.05)",
        hover: "0 8px 30px rgba(0, 0, 0, 0.08)",
      }
    },
  },
  plugins: [],
}
