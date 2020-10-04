import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '@/views/Home.vue';
import Proposals from '@/views/Proposals.vue';
import Proposal from '@/views/Proposal.vue';
import Create from '@/views/Create.vue';
import spaces from '@/spaces';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  { path: '/:key/proposal/:id', name: 'proposal', component: Proposal },
  { path: '/:key/create', name: 'create', component: Create },
  { path: '/:key', name: 'proposals', component: Proposals },
  { path: '/:key/:tab', name: 'proposals-tab', component: Proposals },
  { path: '/', name: 'home', component: Home },
  { path: '/*', name: 'error-404', beforeEnter: (to, from, next) => next('/') }
];

const router = new VueRouter({
  mode: 'hash',
  routes
});

router.beforeEach((to, from, next) => {
  if (to.params.key && !(to.params.key in spaces)) next('/');
  else next();
});

export default router;
