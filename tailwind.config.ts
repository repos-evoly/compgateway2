import type { Config } from "tailwindcss";

import colors from './public/colors';


export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        info: {
          main: colors.info.main,
          light: colors.info.light,
          dark: colors.info.dark,
        },
        warning: {
          light: colors.warning.light,
          main: colors.warning.main,
        },
        secondary: {
          main: colors.secondary.main,
          dark: colors.secondary.dark,
          light: colors.secondary.light,
        },
        success: {
          main: colors.success.main,
          dark: colors.success.dark,
          light: colors.success.light,
        },
        error: {
          main: colors.error.main,
        },
        text: {
          light: colors.text.light,
          dark: colors.text.dark,
        },
      },
      fontFamily: {
        cairo: ["Cairo", "sans-serif"], 
      },
    },
  },
  plugins: [],
} satisfies Config;
