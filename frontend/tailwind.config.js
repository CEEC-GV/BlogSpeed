/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        primary: "#2563EB",
        surface: "#F9FAFB",
        border: "#E5E7EB",
        text: {
          primary: "#111827",
          secondary: "#6B7280"
        }
      }
    }
  },
  plugins: [typography]
};
