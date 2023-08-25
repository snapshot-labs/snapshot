import pkg from '@/../package.json';
import { formatEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import voting from '@snapshot-labs/snapshot.js/src/voting';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

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

export function mapOldPluginNames(space) {
  // The Dao Module has been renamed to SafeSnap
  // Previous spaces plugins have to be renamed
  if (space.plugins?.daoModule) {
    space.plugins.safeSnap = space.plugins.daoModule;
    delete space.plugins.daoModule;
  }

  return space;
}

export function formatAmount(amount, maxDecimals) {
  let out = formatEther(amount);
  if (maxDecimals && out.includes('.')) {
    const parts = out.split('.');
    if (parts[1].length > maxDecimals) {
      out = `~${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
    }
  }
  return `${out} ETH`;
}

export function parseAmount(input) {
  return BigNumber.from(input).toString();
}

export function parseValueInput(input) {
  try {
    return parseAmount(input);
  } catch (e) {
    return input;
  }
}

export function getNumberWithOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function explorerUrl(network, str: string, type = 'address'): string {
  return `${networks[network].explorer.url}/${type}/${str}`;
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

export function getIpfsUrl(url: string) {
  const gateway: any =
    import.meta.env.VITE_IPFS_GATEWAY || 'cloudflare-ipfs.com';
  return getUrl(url, gateway);
}

export async function clearStampCache(id: string, type = 'space') {
  if (type === 'space')
    return await fetch(`https://cdn.stamp.fyi/clear/space/${id}`);

  if (type === 'avatar')
    return await fetch(`https://cdn.stamp.fyi/clear/avatar/eth:${id}`);
}

export function urlify(text: string, target = '_blank') {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    `<a href="$1" target="${target}" rel="noopener">$1</a>`
  );
}

export async function resolveEns(handle: string) {
  try {
    const broviderUrl = import.meta.env.VITE_BROVIDER_URL;
    const provider = getProvider('1', { broviderUrl });
    const addressResolved = await provider.resolveName(handle);
    if (!addressResolved) throw new Error('Invalid ENS name');
    return addressResolved;
  } catch (error) {
    console.error('Error in resolveEns:', error);
    return null;
  }
}

export async function resolveLens(handle: string) {
  try {
    const response = await fetch('https://api.lens.dev/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query Profiles {
            profiles(request: { handles: ["${handle}"], limit: 1 }) {
              items {
                ownedBy
              }
            }
          }
        `
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const result = await response.json();
    return result.data?.profiles?.items?.[0]?.ownedBy;
  } catch (error) {
    console.error('Error in resolveLens:', error);
    return null;
  }
}
