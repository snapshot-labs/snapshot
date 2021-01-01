import { createApp } from 'vue';
import autofocus from 'vue-autofocus-directive';
import infiniteScroll from 'vue-infinite-scroll';
import TextareaAutosize from 'vue-textarea-autosize';
import VueClipboard from 'vue3-clipboard';
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

const app = createApp(App)
  .use(i18n)
  .use(router)
  .use(store);

app.use(VueClipboard);
app.use(infiniteScroll);
app.use(TextareaAutosize);

const requireComponent = require.context('@/components', true, /[\w-]+\.vue$/);
requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  );
  app.component(componentName, componentConfig.default || componentConfig);
});

app.component('jazzicon', Jazzicon);
app.mixin(mixins);
app.directive('autofocus', autofocus);

app.mount('#app');
