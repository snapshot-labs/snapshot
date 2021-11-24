import domains from '@/../snapshot-spaces/spaces/domains.json';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';

export function useDomain() {
  const domainName = window.location.hostname;
  let env = 'master';
  if (domainName.includes('localhost')) env = 'local';
  if (domainName === 'demo.snapshot.org') env = 'develop';
  let domain = domains[domainName];

  if (env === 'local') {
    domain = import.meta.env.VITE_VIEW_AS_SPACE ?? domain;
  }

  const alias = Object.keys(aliases).find(alias => aliases[alias] === domain);

  return { domain, alias, env };
}
