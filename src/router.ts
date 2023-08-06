import { createRouter, createWebHashHistory, RouteLocation } from 'vue-router';

import DelegateView from '@/views/DelegateView.vue';
import ExploreView from '@/views/ExploreView.vue';
import AboutView from '@/views/AboutView.vue';
import PlaygroundView from '@/views/PlaygroundView.vue';
import SetupView from '@/views/SetupView.vue';
import StrategyView from '@/views/StrategyView.vue';
import TimelineView from '@/views/TimelineView.vue';
import RankingView from '@/views/RankingView.vue';

import ProfileView from '@/views/ProfileView.vue';
import ProfileAbout from '@/views/ProfileAbout.vue';
import ProfileActivity from '@/views/ProfileActivity.vue';

import SpaceView from '@/views/SpaceView.vue';
import SpaceProposals from '@/views/SpaceProposals.vue';
import SpaceProposal from '@/views/SpaceProposal.vue';
import SpaceCreate from '@/views/SpaceCreate.vue';
import SpaceSettings from '@/views/SpaceSettings.vue';
import SpaceAbout from '@/views/SpaceAbout.vue';
import SpaceTreasury from './views/SpaceTreasury.vue';
import SpaceDelegates from './views/SpaceDelegates.vue';

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
    path: 'create/:sourceProposal?',
    name: 'spaceCreate',
    component: SpaceCreate
  },

  {
    path: 'about',
    name: 'spaceAbout',
    component: SpaceAbout
  },
  {
    path: 'settings',
    name: 'spaceSettings',
    component: SpaceSettings
  },
  {
    path: 'treasury/:wallet?',
    name: 'spaceTreasury',
    component: SpaceTreasury
  },
  {
    path: 'delegates',
    name: 'spaceDelegates',
    component: SpaceDelegates
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
    { path: '/', name: 'home', component: ExploreView },
    { path: '/about', name: 'about', component: AboutView },
    {
      path: '/setup/:ens?',
      name: 'setup',
      component: SetupView
    },
    { path: '/timeline', name: 'timeline', component: TimelineView },
    { path: '/ranking', name: 'ranking', component: RankingView },
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
    { path: '/delegate/:key?/:to?', name: 'delegate', component: DelegateView },
    {
      path: '/:key',
      name: 'space',
      component: SpaceView,
      children: spaceRoutes,
      beforeEnter: to => {
        // Make sure key is lowercase
        if (to.params.key) {
          to.params.key = to.params.key.toLowerCase();
        }
      }
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
  scrollBehavior(to, _from, savedPosition) {
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

export { routes };

export default router;
