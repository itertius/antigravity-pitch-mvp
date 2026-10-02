/** @type {import('tailwindcss').Config} */
export default {
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
      },
      keyframes: {
        strobe: {
          '0%, 100%': { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.8)' },
        }
      },
      animation: {
        'alarm': 'strobe 0.8s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
