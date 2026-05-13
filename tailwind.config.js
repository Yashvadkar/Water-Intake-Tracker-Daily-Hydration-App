/** @type {import('tailwindcss').Config} */

// 🎨 AQUA-MINIMALIST THEME for Water Intake Tracker
// Deep Azure + Cyan Frost + White — designed for the 8xEngineer contest

module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Core Aqua-Minimalist palette
        'deep-azure': '#0A2647',
        'cyan-frost': '#93C6E7',
        'aqua-glow': '#2E8BC0',
        background: '#061527',     // Darker shade of Deep Azure for backgrounds
        accent: '#93C6E7',         // Cyan Frost as primary accent
        surface: '#0D2F55',        // Elevated surface
        surface2: '#133B68',       // Higher elevation surface
        muted: '#5A7FA0',          // Muted text on dark
        // Semantic colors
        success: '#4ADE80',
        warning: '#FBBF24',
        danger: '#F87171',
      },
    },
  },
  plugins: [],
}
