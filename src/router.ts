import { createRouter, createWebHashHistory } from 'vue-router';
import domains from '@/../snapshot-spaces/spaces/domains.json';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import Home from '@/views/Home.vue';
import Proposal from '@/views/Proposal.vue';
import Create from '@/views/Create.vue';
import Setup from '@/views/Setup.vue';
import Settings from '@/views/Settings.vue';
import Explore from '@/views/Explore.vue';
import Strategy from '@/views/Strategy.vue';
import Playground from '@/views/Playground.vue';
import Delegate from '@/views/Delegate.vue';
import Timeline from '@/views/Timeline.vue';
import Space from '@/views/Space.vue';
import About from '@/views/About.vue';

const domainName = window.location.hostname;

const beforeEnter = (to: any, from, next) => {
  if (aliases?.[to?.params?.key]) {
    to.params.key = aliases[to.params.key];
    return next(to);
  }
  next();
};

const routes: any[] = [
  {
    path: '/',
    name: 'home',
    component: domains[domainName] ? Space : Home
  },
  { path: '/setup', name: 'setup', component: Setup },
  { path: '/:key/settings/:from?', name: 'settings', component: Settings },
  { path: '/networks', name: 'networks', component: Explore },
  { path: '/strategies', name: 'strategies', component: Explore },
  { path: '/plugins', name: 'plugins', component: Explore },
  { path: '/skins', name: 'skins', component: Explore },
  { path: '/delegate/:key?/:to?', name: 'delegate', component: Delegate },
  { path: '/timeline', name: 'timeline', component: Timeline },
  { path: '/explore', name: 'explore', component: Timeline },
  {
    path: '/strategy/:name',
    name: 'strategy',
    component: Strategy
  },
  {
    path: '/playground/:name',
    name: 'playground',
    component: Playground
  },
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
    component: Space,
    beforeEnter
  },
  {
    path: '/:key/about',
    name: 'about',
    component: About,
    beforeEnter
  },
  { path: '/*', name: 'error-404', beforeEnter: (to, from, next) => next('/') }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(): {} {
    return { top: 0 };
  }
});

export default router;
