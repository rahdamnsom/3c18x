/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          DEFAULT: "#e67e22", // Deep orange (warm, not typical AI)
          foreground: "#ffffff",
        },
        primary: {
          DEFAULT: "#2c3e50", // Dark slate
          foreground: "#ecf0f1",
        },
        secondary: {
          DEFAULT: "#27ae60", // Forest green
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};
