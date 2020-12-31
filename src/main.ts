import Vue, { createApp, h } from 'vue';
import PortalVue from 'portal-vue';
import autofocus from 'vue-autofocus-directive';
import infiniteScroll from 'vue-infinite-scroll';
import TextareaAutosize from 'vue-textarea-autosize';
import VueClipboard from 'vue-clipboard2';
import Jazzicon from 'vue-jazzicon';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import mixins from '@/mixins';
import i18n from '@/i18n';
import '@/auth';
import '@/helpers/skins';
import '@/style.scss';

Vue.use(PortalVue);
Vue.use(VueClipboard);
Vue.use(infiniteScroll);
Vue.use(TextareaAutosize);

const requireComponent = require.context('@/components', true, /[\w-]+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  );
  Vue.component(componentName, componentConfig.default || componentConfig);
});

Vue.component('jazzicon', Jazzicon);
Vue.mixin(mixins);
Vue.directive('autofocus', autofocus);

createApp({
  i18n,
  render: () => h(App)
})
  .use(router)
  .use(store)
  .mount('#app');
