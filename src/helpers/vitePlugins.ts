import vue from '@vitejs/plugin-vue';
import ViteComponents from 'unplugin-vue-components/vite';
import visualizer from 'rollup-plugin-visualizer';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import AutoImport from 'unplugin-auto-import/vite';

export const getPlugins = () => [
  vue({ reactivityTransform: true }),
  AutoImport({
    dts: true,
    imports: ['vue', 'vue-router'],
    dirs: ['./src/composables'],
    eslintrc: {
      enabled: true
    }
  }),
  ViteComponents({
    globs: ['src/components/**/*.vue', '!src/components/Tune/_Form/*.vue'],
    resolvers: [
      IconsResolver({
        customCollections: ['s'],
        alias: {
          ho: 'heroicons-outline'
        }
      })
    ]
  }),
  visualizer({
    filename: './dist/stats.html',
    template: 'sunburst',
    gzipSize: true
  }),
  Icons({
    compiler: 'vue3',
    customCollections: {
      s: FileSystemIconLoader('./src/assets/icons', svg =>
        svg.replace(/^<svg /, '<svg fill="currentColor" ')
      )
    }
  }),
  // ATTENTION: Keep the Sentry plugin last
  sentryVitePlugin({
    org: process.env.SENTRY_ORG,
    project: 'snapshot',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    disable: process.env.VITE_ENV !== 'production'
  })
];
