/** @type {import('tailwindcss').Config} */
export default {
  content: ['./**/*.{js,jsx}', '!./node_modules/**'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      // Two steps below text-xs (12px) for dense chips, badges, and meta labels.
      // Size-only (no line-height) so they behave like the text-[11px]/[10px]
      // arbitrary values they replace.
      fontSize: {
        '2xs': '0.6875rem', // 11px
        '3xs': '0.625rem', // 10px
      },
      colors: {
        brand: {
          25: '#F5F8FF',
          50: '#EFF4FF',
          100: '#D1E0FF',
          200: '#B2CCFF',
          300: '#84ADFF',
          400: '#528BFF',
          500: '#2970FF',
          600: '#155EEF',
          700: '#004EEB',
          800: '#0040C1',
          900: '#00359E',
          950: '#002266',
        },
        gray: {
          25: '#FCFCFD',
          50: '#F9FAFB',
          100: '#F2F4F7',
          200: '#EAECF0',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828',
          950: '#0C111D',
        },
        success: {
          50: '#ECFDF3',
          500: '#17B26A',
          700: '#067647',
        },
        warning: {
          50: '#FFFAEB',
          500: '#F79009',
          700: '#B54708',
        },
        error: {
          50: '#FEF3F2',
          500: '#F04438',
          700: '#B42318',
        },
      },
      // Design refresh: square corners everywhere (cards, buttons, inputs,
      // chips, modals). `full` is kept round for genuinely circular elements
      // (spinners, agent dots).
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '9999px',
      },
      boxShadow: {
        xs: '0px 1px 2px rgba(16, 24, 40, 0.05)',
        sm: '0px 1px 3px rgba(16, 24, 40, 0.10), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        md: '0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
        lg: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
        xl: '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
      },
    },
  },
  plugins: [],
}
