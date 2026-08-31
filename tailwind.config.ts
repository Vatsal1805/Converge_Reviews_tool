import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1C2321',
        paper: {
          DEFAULT: '#EDEAE1',
          raised: '#FFFFFF',
        },
        brass: {
          DEFAULT: '#9C6B1F',
          deep: '#6E4A12',
        },
        line: '#D9D4C7',
        signal: {
          good: '#3F6C4C',
        },
      },
      fontFamily: {
        sans: ['var(--font-ibm-sans)', 'sans-serif'],
        display: ['var(--font-outfit)', 'var(--font-fraunces)', 'sans-serif'],
        mono: ['var(--font-ibm-mono)', 'monospace'],
      },
      boxShadow: {
        slip: '0 2px 12px -2px rgba(28, 35, 33, 0.08), 0 1px 3px -1px rgba(28, 35, 33, 0.05)',
        'slip-hover': '0 8px 24px -4px rgba(28, 35, 33, 0.12), 0 2px 6px -1px rgba(28, 35, 33, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
