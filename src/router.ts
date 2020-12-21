import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import domains from '@snapshot-labs/snapshot-spaces/spaces/domains.json';
import aliases from '@snapshot-labs/snapshot-spaces/spaces/aliases.json';
import Home from '@/views/Home.vue';
import Proposals from '@/views/Proposals.vue';
import Proposal from '@/views/Proposal.vue';
import Create from '@/views/Create.vue';
import Setup from '@/views/Setup.vue';
import Settings from '@/views/Settings.vue';
import Explore from '@/views/Explore.vue';
import Delegate from '@/views/Delegate.vue';

Vue.use(VueRouter);
const domainName = window.location.hostname;

const beforeEnter = (to: any, from, next) => {
  if (aliases?.[to?.params?.key]) {
    to.params.key = aliases[to.params.key];
    return next(to);
  }
  next();
};

const routes: Array<RouteConfig> = [
  { path: '/setup', name: 'setup', component: Setup },
  { path: '/:key/settings/:from?', name: 'settings', component: Settings },
  { path: '/networks', name: 'networks', component: Explore },
  { path: '/strategies', name: 'strategies', component: Explore },
  { path: '/plugins', name: 'plugins', component: Explore },
  { path: '/skins', name: 'skins', component: Explore },
  { path: '/delegate', name: 'delegate', component: Delegate },
  {
    path: '/:key/proposal/:id',
    name: 'proposal',
    component: Proposal,
    beforeEnter
  },
  {
    path: '/:key/create/:from?',
    name: 'create',
    component: Create,
    beforeEnter
  },
  {
    path: '/:key',
    name: 'proposals',
    component: Proposals,
    beforeEnter
  },
  {
    path: '/:key/:tab',
    name: 'proposals-tab',
    component: Proposals,
    beforeEnter
  },
  {
    path: '/',
    name: 'home',
    component: domains[domainName] ? Proposals : Home
  },
  { path: '/*', name: 'error-404', beforeEnter: (to, from, next) => next('/') }
];

const router = new VueRouter({
  mode: 'hash',
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  }
});

export default router;
