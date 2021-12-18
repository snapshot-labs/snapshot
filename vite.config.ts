import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ViteComponents from 'unplugin-vue-components/vite';
import visualizer from 'rollup-plugin-visualizer';

export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [
    vue({ reactivityTransform: true }),
    ViteComponents({ directoryAsNamespace: true }),
    visualizer({
      filename: './dist/stats.html',
      template: 'sunburst',
      gzipSize: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    dedupe: ['@popperjs/core']
  },
  optimizeDeps: {
    // @ts-ignore
    allowNodeBuiltins: ['stream']
  }
});
