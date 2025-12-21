/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark theme colors
        dark: {
          bg: '#111827',
          card: '#1F2937',
          border: '#374151',
          text: '#FFFFFF',
          muted: '#9CA3AF',
        },
        // Light theme colors
        light: {
          bg: '#F9FAFB',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#1F2937',
          muted: '#6B7280',
        },
        // Accent colors
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};

