import Vuex from 'vuex';
import modules from '@/store/modules';

const store = Vuex.createStore({
  modules,
  strict: process.env.NODE_ENV !== 'production'
});

export default store;
