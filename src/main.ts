import { Buffer } from 'buffer';
(window as any).global = window;
(window as any).Buffer = Buffer;
import { createApp, h } from 'vue';
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue3';
import options from '@/helpers/auth';
import '../snapshot-spaces/skins';
import App from '@/App.vue';
import router from '@/router';
import i18n from '@/helpers/i18n';
import '@/helpers/auth';
import '@/style.scss';
import VueTippy from 'vue-tippy';

const app = createApp({ render: () => h(App) })
  .use(i18n)
  .use(router)
  .use(LockPlugin, options)
  .use(VueTippy, {
    defaultProps: { delay: [400, null] },
    directive: 'tippy' // => v-tippy
  });

app.mount('#app');

export default app;
