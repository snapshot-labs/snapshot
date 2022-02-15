import pkg from '@/../package.json';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import voting from '@snapshot-labs/snapshot.js/src/voting';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';

export function shortenAddress(str = '') {
  return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export function shorten(str: string, key?: any): string {
  if (!str) return str;
  let limit;
  if (typeof key === 'number') limit = key;
  if (key === 'symbol') limit = 6;
  if (key === 'name') limit = 64;
  if (key === 'choice') limit = 12;
  if (limit)
    return str.length > limit ? `${str.slice(0, limit).trim()}...` : str;
  return shortenAddress(str);
}

export function getChoiceString(proposal, selected) {
  const votingClass = new voting[proposal.type](proposal, '', '', selected);
  return votingClass.getChoiceString();
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

export function formatSpace(space) {
  if (space?.plugins?.daoModule) {
    // The Dao Module has been renamed to SafeSnap
    // Previous spaces plugins have to be renamed
    space.plugins.safeSnap = space.plugins.daoModule;
    delete space.plugins.daoModule;
  }
  if (space?.skin === null) delete space.skin;
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

export const formatAmount = (amount, maxDecimals) => {
  let out = formatEther(amount);
  if (maxDecimals && out.includes('.')) {
    const parts = out.split('.');
    if (parts[1].length > maxDecimals) {
      out = '~' + parts[0] + '.' + parts[1].slice(0, maxDecimals);
    }
  }
  return out + ' ETH';
};

export const parseAmount = input => {
  return BigNumber.from(input).toString();
};

export const parseValueInput = input => {
  try {
    return parseAmount(input);
  } catch (e) {
    return input;
  }
};

export function getNumberWithOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function explorerUrl(network, str: string, type = 'address'): string {
  return `${networks[network].explorer}/${type}/${str}`;
}

export function calcFromSeconds(value, unit) {
  if (unit === 'm') return Math.floor(value / 60);
  if (unit === 'h') return Math.floor(value / (60 * 60));
  if (unit === 'd') return Math.floor(value / (60 * 60 * 24));
}

export function calcToSeconds(value, unit) {
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 60 * 60;
  if (unit === 'd') return value * 60 * 60 * 24;
}

export function getIpfsUrl(url) {
  const gateway: any =
    import.meta.env.VITE_IPFS_GATEWAY || 'cloudflare-ipfs.com';
  return getUrl(url, gateway);
}
