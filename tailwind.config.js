module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{js,ts,vue}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        snapshot: '#f3b04e', // TODO: get correct color for snapshot logo
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
      ]
    },
    fontWeight: {
      'font-normal': 500,
      bold: 600
    },
    fontSize: {
      '2xl': ['36px', '50px'],
      xl: ['28px', '44px'],
      lg: ['24px', '32px'],
      md: ['20px', '28px'],
      base: ['18px', '24px'],
      sm: ['16px', '22px'],
      xs: ['14px', '20px']
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
