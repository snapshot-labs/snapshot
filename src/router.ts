import { createRouter, createWebHashHistory, RouteLocation } from 'vue-router';
import { useApp } from '@/composables/useApp';

import DelegateView from '@/views/DelegateView.vue';
import ExploreView from '@/views/ExploreView.vue';
import HomeView from '@/views/HomeView.vue';
import PlaygroundView from '@/views/PlaygroundView.vue';
import SetupView from '@/views/SetupView.vue';
import StrategyView from '@/views/StrategyView.vue';
import TimelineView from '@/views/TimelineView.vue';

import ProfileView from '@/views/ProfileView.vue';
import ProfileAbout from '@/views/ProfileAbout.vue';
import ProfileActivity from '@/views/ProfileActivity.vue';

import SpaceView from '@/views/SpaceView.vue';
import SpaceProposals from '@/views/SpaceProposals.vue';
import SpaceProposal from '@/views/SpaceProposal.vue';
import SpaceCreate from '@/views/SpaceCreate.vue';
import SpaceSettings from '@/views/SpaceSettings.vue';
import SpaceAbout from '@/views/SpaceAbout.vue';

// The frontend shows all spaces or just a single one, when being accessed
// through that space's custom domain.
const { domain, domainAlias } = useApp();
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
    path: 'create/:step?/:sourceProposal?',
    name: 'spaceCreate',
    component: SpaceCreate
  },

  {
    path: 'about',
    name: 'spaceAbout',
    component: SpaceAbout
  },
  {
    path: 'settings/:sourceSpace?',
    name: 'spaceSettings',
    component: SpaceSettings
  }
];

const profileRoutes = [
  {
    path: '',
    name: 'profileActivity',
    component: ProfileActivity
  },
  {
    path: 'about/',
    name: 'profileAbout',
    component: ProfileAbout
  }
];

// If accessed through custom domain, mount space routes under /.
// Requests starting with /:key will be redirected.
// E.g. /balancer/proposal/:proposalId becomes /proposal/:proposalId
if (domain) {
  routes.push(
    { path: '/', name: 'home', component: SpaceView, children: spaceRoutes },
    { path: '/delegate/:key?/:to?', name: 'delegate', component: DelegateView },
    {
      path: '/playground/:name',
      name: 'playground',
      component: PlaygroundView
    },
    {
      path: `/${domain}`,
      alias: `/${domainAlias ?? domain}`,
      name: 'home-redirect',
      redirect: '/'
    },
    {
      path: `/${domain}/:path(.*)`,
      alias: `/${domainAlias ?? domain}/:path(.*)`,
      name: 'space-redirect',
      redirect: (to: RouteLocation) => ({ path: `/${to.params.path}` })
    }
  );
} else {
  // If accessed through localhost or snapshot.org, add all routes and
  // prefix space routes with space domain (/:key).
  routes.push(
    { path: '/', name: 'home', component: HomeView },
    { path: '/setup/:step?/:ens?', name: 'setup', component: SetupView },
    { path: '/networks', name: 'networks', component: ExploreView },
    { path: '/strategies', name: 'strategies', component: ExploreView },
    { path: '/plugins', name: 'plugins', component: ExploreView },
    { path: '/delegate/:key?/:to?', name: 'delegate', component: DelegateView },
    { path: '/timeline', name: 'timeline', component: TimelineView },
    { path: '/explore', name: 'explore', component: TimelineView },
    {
      path: '/playground/:name',
      name: 'playground',
      component: PlaygroundView
    },
    { path: '/strategy/:name', name: 'strategy', component: StrategyView },
    {
      path: '/profile/:address',
      name: 'profile',
      component: ProfileView,
      children: profileRoutes
    },
    {
      path: '/:key',
      name: 'space',
      component: SpaceView,
      children: spaceRoutes
    }
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
