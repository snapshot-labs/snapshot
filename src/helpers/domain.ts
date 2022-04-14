import { apolloClient } from '@/helpers/apollo';
import { CUSTOM_DOMAIN_SPACE_QUERY } from '@/helpers/queries';
import aliases from '@/spaces/aliases.json';

let domain = window.location.hostname;
let env = 'master';
if (domain.includes('localhost')) env = 'local';
if (domain === 'demo.snapshot.org') env = 'develop';

if (env === 'local') {
  domain = import.meta.env.VITE_VIEW_AS_DOMAIN as string ?? domain;
}

const customDomainAlias = Object.keys(aliases).find(
  alias => aliases[alias] === domain
);

let customDomainSpace: { id: string, skin: string } | null = null;

const res = await apolloClient.query({
  query: CUSTOM_DOMAIN_SPACE_QUERY,
  variables: {
    domain
  }
});

if (res.errors) {
  throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
}

customDomainSpace = res.data?.space;

export { domain, customDomainSpace, customDomainAlias, env };