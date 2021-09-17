import {
  createRouter,
  createWebHashHistory,
  RouteLocationNormalized
} from 'vue-router';
import domains from '@/../snapshot-spaces/spaces/domains.json';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import Home from '@/views/Home.vue';
import SpaceProposal from '@/views/SpaceProposal.vue';
import SpaceCreate from '@/views/SpaceCreate.vue';
import Setup from '@/views/Setup.vue';
import SpaceSettings from '@/views/SpaceSettings.vue';
import Explore from '@/views/Explore.vue';
import Strategy from '@/views/Strategy.vue';
import Playground from '@/views/Playground.vue';
import Delegate from '@/views/Delegate.vue';
import Timeline from '@/views/Timeline.vue';
import Space from '@/views/Space.vue';
import SpaceAbout from '@/views/SpaceAbout.vue';
import SpaceProposals from '@/views/SpaceProposals.vue';

const domainName = window.location.hostname;

const spaceChildrenRoutes = [
  {
    path: '',
    name: 'spaceProposals',
    component: SpaceProposals
  },
  {
    path: 'proposal/:id',
    name: 'spaceProposal',
    component: SpaceProposal
  },
  {
    path: 'create/:from?',
    name: 'spaceCreate',
    component: SpaceCreate
  },

  {
    path: 'about',
    name: 'spaceAbout',
    component: SpaceAbout
  },
  {
    path: 'settings/:from?',
    name: 'spaceSettings',
    component: SpaceSettings
  }
];

const homeRoutes = domains[domainName]
  ? [
      {
        path: '/',
        name: 'home',
        component: Space,
        children: spaceChildrenRoutes
      }
    ]
  : [
      {
        path: '/',
        name: 'home',
        component: Home
      }
    ];

const spaceRoutes = domains[domainName]
  ? [
      {
        path: '/:key',
        name: 'space',
        redirect: {
          path: `/`
        }
      }
    ]
  : [
      {
        path: '/:key',
        name: 'space',
        component: Space,
        children: spaceChildrenRoutes
      }
    ];

const routes: any[] = [
  ...homeRoutes,
  { path: '/setup', name: 'setup', component: Setup },
  { path: '/networks', name: 'networks', component: Explore },
  { path: '/strategies', name: 'strategies', component: Explore },
  { path: '/plugins', name: 'plugins', component: Explore },
  { path: '/skins', name: 'skins', component: Explore },
  { path: '/delegate/:key?/:to?', name: 'delegate', component: Delegate },
  { path: '/timeline', name: 'timeline', component: Timeline },
  { path: '/explore', name: 'explore', component: Timeline },
  {
    path: '/playground/:name',
    name: 'playground',
    component: Playground
  },
  {
    path: '/strategy/:name',
    name: 'strategy',
    component: Strategy
  },
  ...spaceRoutes,
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
