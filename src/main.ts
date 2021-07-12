import { createApp, h, provide } from 'vue';
import VueClipboard from 'vue3-clipboard';
import Jazzicon from 'vue3-jazzicon/src/components';
import { LockPlugin } from '@snapshot-labs/lock/plugins/vue3';
import options from '@/auth';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import mixins from '@/mixins';
import i18n from '@/i18n';
import '@/auth';
import '@/helpers/skins';
import '@/style.scss';
import { apolloClient } from '@/apollo';
import { DefaultApolloClient } from '@vue/apollo-composable';

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App)
})
  .use(i18n)
  .use(router)
  .use(store)

  .use(VueClipboard, {
    autoSetContainer: true
  })
  .use(LockPlugin, options)

  .component('jazzicon', Jazzicon)
  .mixin(mixins);

app.mount('#app');

export default app;
