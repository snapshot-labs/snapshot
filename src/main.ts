import { Buffer } from 'buffer';
(window as any).global = window;
(window as any).Buffer = Buffer;
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue3';
import options from '@/helpers/auth';
import '../snapshot-spaces/skins';
import App from '@/App.vue';
import router from '@/router';
import i18n from '@/helpers/i18n';
import '@/helpers/auth';
import '@snapshot-labs/tune/dist/style.css';
import '@/style.scss';
import { apolloClient } from '@/helpers/apollo';
import { DefaultApolloClient } from '@vue/apollo-composable';
import VueTippy from 'vue-tippy';
import { createHead } from '@vueuse/head';
import 'viewerjs/dist/viewer.css';
import VueViewer from 'v-viewer';
import { initSentry } from '@/sentry';

const head = createHead();

const knownHosts = ['app.safe.global', 'pilot.gnosisguild.org'];
const parentUrl =
  window.location != window.parent.location
    ? document.referrer ||
      document.location.ancestorOrigins[
        document.location.ancestorOrigins.length - 1
      ]
    : document.location.href;
const parentHost = new URL(parentUrl).host;
if (window !== window.parent && !knownHosts.includes(parentHost)) {
  document.documentElement.style.display = 'none';
  throw new Error(`Unknown host: ${parentHost}`);
}

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App)
});

initSentry(app, router);

app
  .use(head)
  .use(i18n)
  .use(router)
  .use(LockPlugin, options)
  .use(VueTippy, {
    defaultProps: { delay: [400, null] },
    directive: 'tippy' // => v-tippy
  })
  .use(VueViewer, { defaultOptions: { navbar: true, toolbar: false } });

app.mount('#app');

export default app;
