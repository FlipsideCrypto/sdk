module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    fontFamily: {
      title: ["Syne", "sans-serif"],
      heading: ["Poppins", "sans-serif"],
      mono: ["Simplon Mono", "monospace"],
      retro: ["VT323", "monospace"],
      cartridge: ["Cartridge", "Poppins", "sans-serif"],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
