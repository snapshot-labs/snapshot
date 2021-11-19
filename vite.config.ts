import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import ViteComponents from 'unplugin-vue-components/vite';
import visualizer from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()));
  
  return {
    base: process.env.VITE_BASE_PATH || '/',
    define: {
      'process.env': process.env
    },
    plugins: [
      vue({
        script: {
          refSugar: true
        }
      }),
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
      include: ['color'],
      // @ts-ignore
      allowNodeBuiltins: ['stream']
    }
  }
});
