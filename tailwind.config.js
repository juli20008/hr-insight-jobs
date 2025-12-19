/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ❌ 确保这里是空的，或者不要有 colors 覆盖
    },
  },
  plugins: [],
}