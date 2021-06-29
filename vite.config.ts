import path from 'path';
import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import ViteComponents from 'vite-plugin-components';

export default defineConfig({
  plugins: [Vue(), ViteComponents()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
