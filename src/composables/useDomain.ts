import domains from '@snapshot-labs/snapshot-spaces/spaces/domains.json';

export function useDomain() {
  const domainName = window.location.hostname;
  let env = 'master';
  if (domainName.includes('localhost')) env = 'local';
  if (domainName === 'demo.snapshot.org') env = 'develop';
  const domain = domains[domainName];

  return { domain, env };
}
