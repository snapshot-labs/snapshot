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
import Profile from '@/views/Profile.vue';
import ProfileAbout from '@/views/ProfileAbout.vue';
import ProfileActivity from '@/views/ProfileActivity.vue';
import { useApp } from '@/composables/useApp';

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
    { path: '/', name: 'home', component: Space, children: spaceRoutes },
    { path: '/delegate/:key?/:to?', name: 'delegate', component: Delegate },
    { path: '/playground/:name', name: 'playground', component: Playground },
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
    { path: '/', name: 'home', component: Home },
    { path: '/setup/:step?/:ens?', name: 'setup', component: Setup },
    { path: '/networks', name: 'networks', component: Explore },
    { path: '/strategies', name: 'strategies', component: Explore },
    { path: '/plugins', name: 'plugins', component: Explore },
    { path: '/delegate/:key?/:to?', name: 'delegate', component: Delegate },
    { path: '/timeline', name: 'timeline', component: Timeline },
    { path: '/explore', name: 'explore', component: Timeline },
    { path: '/playground/:name', name: 'playground', component: Playground },
    { path: '/strategy/:name', name: 'strategy', component: Strategy },
    {
      path: '/profile/:address',
      name: 'profile',
      component: Profile,
      children: profileRoutes
    },
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
