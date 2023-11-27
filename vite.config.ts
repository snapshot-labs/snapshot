/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vitest/config';
import { getPlugins } from './src/helpers/vitePlugins';

export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: getPlugins(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'readable-stream': 'vite-compatible-readable-stream'
    }
  },
  test: {
    environment: 'happy-dom',
    deps: {
      inline: ['@pusher/push-notifications-web']
    }
  },
  build: {
    sourcemap: process.env.VITE_ENV === 'production',
    target: 'esnext'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
});
