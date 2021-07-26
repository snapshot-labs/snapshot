import path from 'path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import ViteComponents from 'vite-plugin-components';

export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [Vue(), ViteComponents({ deep: true, directoryAsNamespace: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['color', 'mersenne-twister']
  }
});
