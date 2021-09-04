module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{js,ts,vue}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        snapshot: '#f3b04e', // TODO: get correct color for snapshot logo
        'skin-border': 'var(--border-color)',
        'skin-text': 'var(--text-color)',
        'skin-link': 'var(--link-color)',
        'skin-bg': 'var(--bg-color)',
        'skin-block-bg': 'var(--block-bg)',
        'skin-header-bg': 'var(--header-bg)',

        blue: '#384aff',
        green: '#21b66f',
        red: '#ff3856'
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
      '2xl': '36px',
      xl: '28px',
      lg: '24px',
      md: '20px',
      base: '18px',
      sm: '16px',
      xs: '14px'
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
