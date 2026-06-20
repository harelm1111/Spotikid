/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F7FAF5",
        surface: "#FFFFFF",
        primary: "#5B8C68",
        primaryDk: "#3E6B4A",
        ink: "#24322A",
        inkSoft: "#5F7268",
        line: "#DCE6DC",
        tint: "#E7F0E3",
        star: "#D89A3A",
      },
    },
  },
  plugins: [],
};
