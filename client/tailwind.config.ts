import type { Config } from "tailwindcss";

const config: Config = {
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
        purple: "#6A49E2",
        lavender: "#B1B1F8",
        bg1:"#02070d",
        bg2:"#040e1b",
        bg3:"#02070D",
        graybg: "#28282A",
        lightgray: "#3C3C3C",
      },
    },
  },
  plugins: [],
};
export default config;
