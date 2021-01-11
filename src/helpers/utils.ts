import pkg from '@/../package.json';

export function shorten(str = '') {
  return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export function jsonParse(input, fallback?) {
  if (typeof input !== 'string') {
    return fallback || {};
  }
  try {
    return JSON.parse(input);
  } catch (err) {
    return fallback || {};
  }
}

export async function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

export function clone(item) {
  return JSON.parse(JSON.stringify(item));
}

export function lsSet(key: string, value: any) {
  return localStorage.setItem(`${pkg.name}.${key}`, JSON.stringify(value));
}

export function lsGet(key: string) {
  const item = localStorage.getItem(`${pkg.name}.${key}`);
  return jsonParse(item, '');
}

export function lsRemove(key: string) {
  return localStorage.removeItem(`${pkg.name}.${key}`);
}

export function formatProposal(proposal) {
  proposal.msg = jsonParse(proposal.msg, proposal.msg);

  // v0.1.0
  if (proposal.msg.version === '0.1.0') {
    proposal.msg.payload.start = 1595088000;
    proposal.msg.payload.end = 1595174400;
    proposal.msg.payload.snapshot = 10484400;
    proposal.bpt_voting_disabled = '1';
  }

  // v0.1.1
  if (proposal.msg.version === '0.1.0' || proposal.msg.version === '0.1.1') {
    proposal.msg.payload.metadata = {};
  }

  return proposal;
}

export function formatProposals(proposals) {
  return Object.fromEntries(
    Object.entries(proposals).map(proposal => [
      proposal[0],
      formatProposal(proposal[1])
    ])
  );
}

export function filterNetworks(networks, spaces, q) {
  return Object.entries(networks)
    .map((network: any) => {
      network[1].key = network[0];
      network[1].spaces = Object.entries(spaces)
        .filter((space: any) => space[1].network === network[0])
        .map(space => space[0]);
      return network[1];
    })
    .filter(network =>
      JSON.stringify(network)
        .toLowerCase()
        .includes(q.toLowerCase())
    )
    .sort((a, b) => b.spaces.length - a.spaces.length);
}

export function filterSkins(skins, spaces, q) {
  return skins
    .map(skin => ({
      key: skin,
      spaces: Object.entries(spaces)
        .filter((space: any) => space[1].skin === skin)
        .map(space => space[0])
    }))
    .filter(skin => skin.key.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.spaces.length - a.spaces.length);
}

export function getStrategy(strategy, spaces) {
  strategy.spaces = Object.entries(spaces)
    .filter(
      (space: any) =>
        space[1].strategies &&
        space[1].strategies
          .map(strategy => strategy.name)
          .includes(strategy.key)
    )
    .map(space => space[0]);
  return strategy;
}

export function filterStrategies(strategies, spaces, q = '') {
  return Object.values(strategies)
    .map((strategy: any) => getStrategy(strategy, spaces))
    .filter(strategy =>
      JSON.stringify(strategy)
        .toLowerCase()
        .includes(q.toLowerCase())
    )
    .sort((a, b) => b.spaces.length - a.spaces.length);
}

export function filterPlugins(plugins, spaces, q = '') {
  return Object.entries(plugins)
    .map(([key, pluginClass]: any) => {
      const plugin = new pluginClass();
      plugin.key = key;
      plugin.spaces = Object.entries(spaces)
        .filter(
          (space: any) =>
            space[1].plugins &&
            Object.keys(space[1].plugins).includes(plugin.key)
        )
        .map(space => space[0]);
      return plugin;
    })
    .filter(plugin =>
      JSON.stringify(plugin)
        .toLowerCase()
        .includes(q.toLowerCase())
    )
    .sort((a, b) => b.spaces.length - a.spaces.length);
}

export function formatSpace(key, space) {
  space = {
    key,
    ...space,
    members: space.members || [],
    filters: space.filters || {}
  };
  if (!space.filters.invalids) space.filters.invalids = [];
  if (!space.filters.minScore) space.filters.minScore = 0;
  return space;
}

export function filterProposals(space, proposal, tab) {
  const ts = (Date.now() / 1e3).toFixed();
  const members = space.members.map(address => address.toLowerCase());
  const author = proposal[1].address.toLowerCase();
  const isMember = members.includes(author);
  const start = proposal[1].msg.payload.start;
  const end = proposal[1].msg.payload.end;

  if (!isMember && proposal[1].score < space.filters.minScore) return false;
  if (space.filters.onlyMembers && !isMember) return false;
  if (space.filters.invalids.includes(proposal[1].authorIpfsHash)) return false;

  if (tab === 'all') return true;
  if (tab === 'active' && start <= ts && end > ts) return true;
  if (tab === 'core' && isMember) return true;
  if (tab === 'community' && !isMember) return true;
  if (tab === 'closed' && end <= ts) return true;
  if (tab === 'pending' && start > ts) return true;

  return false;
}

export function infiniteScroll() {
  window.onscroll = () => {
    const bottomOfWindow =
      document.documentElement.scrollTop + window.innerHeight ===
      document.documentElement.offsetHeight;

    if (bottomOfWindow) {
      // @ts-ignore
      this.limit += 16;
    }
  };
}
