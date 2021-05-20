import pkg from '@/../package.json';
import scrollMonitor from 'scrollmonitor';

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

export function lsGet(key: string, fallback?: any) {
  const item = localStorage.getItem(`${pkg.name}.${key}`);
  return jsonParse(item, fallback);
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

export function formatSpace(key, space) {
  space = {
    key,
    ...space,
    members: space.members || [],
    filters: space.filters || {}
  };
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

  if (tab === 'all') return true;
  if (tab === 'active' && start <= ts && end > ts) return true;
  if (tab === 'core' && isMember) return true;
  if (tab === 'community' && !isMember) return true;
  if (tab === 'closed' && end <= ts) return true;
  if (tab === 'pending' && start > ts) return true;

  return false;
}

export function scrollEndMonitor(fn) {
  let canRunAgain = true;

  const el = document.getElementById('endofpage');
  const elementWatcher = scrollMonitor.create(el);
  elementWatcher.enterViewport(() => {
    if (canRunAgain) {
      canRunAgain = false;
      fn();

      setTimeout(function () {
        canRunAgain = true;
      }, 100);
    }
  });
}
