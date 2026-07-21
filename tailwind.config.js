/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        saans: ['saans', 'saans Fallback', 'Outfit', 'sans-serif'],
      },
      fontSize: {
        'brand-xs': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'brand-sm': ['14px', { lineHeight: '18px', fontWeight: '600' }],
        'brand-md': ['16px', { lineHeight: '20px', fontWeight: '600' }],
        'brand-lg': ['20px', { lineHeight: '24px', fontWeight: '700' }],
        'brand-xl': ['24px', { lineHeight: '28px', fontWeight: '700' }],
        'brand-2xl': ['32px', { lineHeight: '38px', fontWeight: '800' }],
        'brand-3xl': ['80px', { lineHeight: '88px', fontWeight: '900' }],
      },
      colors: {
        brand: {
          text: {
            primary: '#141414',
            secondary: '#707070',
            tertiary: '#adadad',
          },
          surface: {
            raised: '#ffffff',
            base: '#404040',
            muted: '#000000',
          }
        }
      },
      spacing: {
        'brand-1': '4px',
        'brand-2': '8px',
        'brand-3': '12px',
        'brand-4': '16px',
      },
      borderRadius: {
        'brand-xs': '8px',
        'brand-sm': '12.22px',
        'brand-md': '9999px',
      },
      transitionDuration: {
        'brand-instant': '150ms',
        'brand-fast': '200ms',
      }
    },
  },
  plugins: [],
}
