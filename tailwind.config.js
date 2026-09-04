/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ['"Archivo"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        // Escala de tinta (negros/grises) del sistema blanco·azul·negro.
        ink: { DEFAULT: "#0d0f12", 2: "#3f434b", 3: "#8a8a8f" },
        line: "#e7e8ee", // hairline de bordes
        paper: "#fafafb", // fondo/relleno sutil
      },
      boxShadow: {
        card: "0 1px 2px rgba(13,15,18,.04), 0 12px 30px -16px rgba(13,15,18,.12)",
      },
    },
  },
  plugins: [],
};
