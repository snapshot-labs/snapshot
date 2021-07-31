import path from 'path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import ViteComponents from 'vite-plugin-components';
import visualizer from 'rollup-plugin-visualizer';

export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [
    Vue(),
    ViteComponents({ deep: true, directoryAsNamespace: true }),
    visualizer({
      filename: './dist/stats.html',
      template: 'sunburst',
      gzipSize: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['color', 'mersenne-twister']
  }
});
