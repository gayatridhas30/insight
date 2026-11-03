/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0E1726',
          DEFAULT: '#17243A',
          800: '#17243A',
          700: '#233452',
          600: '#344C75',
          100: '#E7ECF3',
          50: '#F3F6FA',
        },
        ivory: {
          DEFAULT: '#F8F7F2',
          50: '#FAF9F5',
          100: '#F4F2E9',
          200: '#EBE7D8',
        },
        coral: {
          DEFAULT: '#FF7058',
          hover: '#E85B43',
          light: '#FFEBE7',
          50: '#FFF5F3',
        },
        sage: {
          DEFAULT: '#A9B9A0',
          dark: '#7D9272',
          light: '#E6EBE3',
          50: '#F3F6F2',
        },
        lavender: {
          DEFAULT: '#DCD7F5',
          dark: '#9384D1',
          light: '#F4F2FC',
          50: '#FAF9FE',
        },
        charcoal: {
          DEFAULT: '#292D35',
          muted: '#636C7C',
          light: '#9AA3B2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
        editorial: ['"DM Sans"', 'serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(23, 36, 58, 0.04)',
        'card': '0 4px 20px -2px rgba(23, 36, 58, 0.08)',
        'hover': '0 12px 30px -4px rgba(23, 36, 58, 0.12)',
        'coral-glow': '0 8px 25px -4px rgba(255, 112, 88, 0.35)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
