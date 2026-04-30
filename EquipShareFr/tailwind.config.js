/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // KFUPM Brand Colors
        primary: {
          DEFAULT: "#003E51", // Primary
          dark: "#002A38",    // Primary Dark
          light: "#005570",   // Primary Light
        },
        accent: "#00879E",     // Teal
        background: "#FFFFFF", // White
        surface: "#F4F7F8",    // Off-white
        text: {
          primary: "#0A1F29",   // Near black
          secondary: "#4A6572", // Muted
        },
        border: "#D0DDE2",     // Light gray-blue
        success: "#1A7F5A",    // Green
        warning: "#D97706",    // Amber
        error: "#DC2626",      // Red
      },
    },
  },
  plugins: [],
};
