module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,vue}'],
  theme: {
    extend: {
      colors: {
        snapshot: '#f3b04e',
        primary: 'var(--primary-color)',
        'skin-border': 'var(--border-color)',
        'skin-text': 'var(--text-color)',
        'skin-link': 'var(--link-color)',
        'skin-bg': 'var(--bg-color)',
        'skin-block-bg': 'var(--block-bg)',
        'skin-header-bg': 'var(--header-bg)',
        'skin-heading': 'var(--heading-color)',
        blue: '#384aff',
        green: '#21b66f',
        red: '#ff3856'
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
    spacing: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '16px',
      4: '24px',
      5: '32px',
      6: '40px'
    },
    screens: {
      xs: '420px',
      sm: '544px',
      md: '768px',
      lg: '1012px',
      xl: '1280px'
    },
    fontFamily: {
      serif: [
        'Calibre, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji'
      ],
      mono: ['monospace']
    },
    fontSize: {
      '2xl': ['36px', '50px'],
      xl: ['28px', '44px'],
      lg: ['24px', '32px'],
      md: ['20px', '28px'],
      base: ['18px', '24px'],
      sm: ['16px'],
      xs: ['14px']
    },
    boxShadow: {
      lg: '0 0 20px -6px var(--border-color)'
    }
  },
  plugins: [require('@tailwindcss/line-clamp')],
  darkMode: 'class'
};
