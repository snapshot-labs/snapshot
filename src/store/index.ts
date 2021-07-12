import { createStore } from 'vuex';
import modules from '@/store/modules';

const store = createStore({
  modules,
  strict: true
});

export default store;
