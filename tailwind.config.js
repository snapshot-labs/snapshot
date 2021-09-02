module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.{js,ts,vue}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        snapshot: '#f3b04e', // TODO: get correct color for snapshot logo
        bcolor: 'var(--border-color)',
        tcolor: 'var(--text-color)',
        lcolor: 'var(--link-color)',
        bgcolor: 'var(--bg-color)'
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
