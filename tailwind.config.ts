import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1B4DCC",
          "blue-dark": "#143a9c",
          orange: "#FF6B00",
          light: "#F5F8FF",
          ink: "#0D1B3E",
          gray: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(27, 77, 204, 0.18)",
        card: "0 4px 24px -8px rgba(13, 27, 62, 0.12)",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(1200px 600px at 80% -10%, rgba(255,107,0,0.10), transparent), linear-gradient(180deg, #F5F8FF 0%, #FFFFFF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
