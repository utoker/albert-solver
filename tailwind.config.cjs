/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        nb: "3px 3px 0 #000",
        "nb-1": "6px 6px 0 #000",
      },
    },
  },
  plugins: [],
};
