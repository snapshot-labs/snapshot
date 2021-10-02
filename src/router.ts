import { createRouter, createWebHashHistory, RouteLocation } from 'vue-router';
import domains from '@/../snapshot-spaces/spaces/domains.json';
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
import aliases from '@/../snapshot-spaces/spaces/aliases.json';

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
      /**
      Its quite hard to match /abc/pqr/abc without using a full pathMatch from vue router. 
      So I have used this, and also tried to handle the situations where the user has a link 
      like this. /balancer/proposals/:proposalId it will redirect the user to /proposals/:proposalId
      Similarly, /balancer.eth will also be redirected. 
      However if the user manually tries to change the space to something else `abc.eth` then the user 
      will be redirected to the homepage.
    */
      {
        path: `/:pathMatch(.*)*`,
        name: 'space',
        redirect: (to: RouteLocation) => {
          const isSpaceRoute =
            Object.keys(aliases).includes(to.params.pathMatch[0]) ||
            Object.values(aliases).includes(to.params.pathMatch[0]) ||
            domains[domainName] === to.params.pathMatch[0];

          if (!isSpaceRoute) {
            return { path: '/' };
          }

          const updatedPath = to.fullPath.replace(
            `/${to.params.pathMatch[0]}`,
            ''
          );

          return { path: updatedPath };
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
  {
    path: '/:pathMatch(.*)*',
    name: 'error-404',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.params.retainScrollPosition) {
      return {};
    }

    if (to.hash) {
      const position = { selector: to.hash };
      return { el: position };
    }

    return { top: 0 };
  }
});

export default router;
