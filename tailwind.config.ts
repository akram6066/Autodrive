import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6F00",  // Orange
        secondary: "#212121", // Dark
        accent: "#FFA726",    // Light Orange
        background: "#F5F5F5",
        error: "#E53935",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
