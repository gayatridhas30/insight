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
          900: '#0B0F19',
          DEFAULT: '#0F172A',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        ivory: {
          DEFAULT: '#F8FAFC',
          50: '#FFFFFF',
          100: '#F1F5F9',
          200: '#E2E8F0',
        },
        coral: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
          50: '#F5F7FF',
        },
        sage: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#D1FAE5',
          50: '#ECFDF5',
        },
        lavender: {
          DEFAULT: '#EEF2FF',
          dark: '#6366F1',
          light: '#F5F7FF',
          50: '#FAF5FF',
        },
        charcoal: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
          light: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        editorial: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)',
        'card': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        'hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'coral-glow': '0 8px 25px -4px rgba(79, 70, 229, 0.35)',
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
