/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#143B68",
          700: "#185FA5",
          500: "#2380B8",
          100: "#E0EDF9",
        },
      },
    },
  },
  plugins: [],
};
