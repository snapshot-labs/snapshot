import { createRouter, createWebHashHistory, RouteLocation } from 'vue-router';
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
import { useDomain } from '@/composables/useDomain';

// The frontend shows all spaces or just a single one, when being accessed
// through that space's custom domain.
const { domain, alias } = useDomain();
const routes: any[] = [];

// These routes get prefixed with the respective space's ENS domain (/:key)
// or they get mounted at "/" in the single space scenario.
const spaceRoutes = [
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

// If accessed through custom domain, mount space routes under /.
// Requests starting with /:key will be redirected.
// E.g. /balancer/proposal/:proposalId becomes /proposal/:proposalId
if (domain) {
  routes.push(
    { path: '/', name: 'home', component: Space, children: spaceRoutes },
    { path: '/delegate/:key?/:to?', name: 'delegate', component: Delegate },
    { path: '/playground/:name', name: 'playground', component: Playground },
    {
      path: `/${domain}`,
      alias: `/${alias ?? domain}`,
      name: 'home-redirect',
      redirect: '/'
    },
    {
      path: `/${domain}/:path(.*)`,
      alias: `/${alias ?? domain}/:path(.*)`,
      name: 'space-redirect',
      redirect: (to: RouteLocation) => ({ path: `/${to.params.path}` })
    }
  );
} else {
  // If accessed through localhost or snapshot.org, add all routes and
  // prefix space routes with space domain (/:key).
  routes.push(
    { path: '/', name: 'home', component: Home },
    { path: '/setup', name: 'setup', component: Setup },
    { path: '/networks', name: 'networks', component: Explore },
    { path: '/strategies', name: 'strategies', component: Explore },
    { path: '/plugins', name: 'plugins', component: Explore },
    { path: '/delegate/:key?/:to?', name: 'delegate', component: Delegate },
    { path: '/timeline', name: 'timeline', component: Timeline },
    { path: '/explore', name: 'explore', component: Timeline },
    { path: '/playground/:name', name: 'playground', component: Playground },
    { path: '/strategy/:name', name: 'strategy', component: Strategy },
    { path: '/:key', name: 'space', component: Space, children: spaceRoutes }
  );
}

// catch all
routes.push({
  path: '/:pathMatch(.*)*',
  name: 'error-404',
  redirect: '/'
});

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
