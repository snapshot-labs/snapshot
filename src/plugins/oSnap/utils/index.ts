import { isAddress } from '@ethersproject/address';
import { JsonRpcProvider } from '@ethersproject/providers';
import { keccak256 } from '@ethersproject/solidity';
import memoize from 'lodash/memoize';

import { SafeExecutionData } from '@/helpers/interfaces';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

export const mustBeEthereumAddress = memoize((address: string) => {
  const startsWith0x = address?.startsWith('0x');
  const isValidAddress = isAddress(address);
  return startsWith0x && isValidAddress;
});

export const mustBeEthereumContractAddress = memoize(
  async (network: string, address: string) => {
    const provider = getProvider(network) as JsonRpcProvider;
    const contractCode = await provider.getCode(address);

    return (
      contractCode && contractCode.replace(/^0x/, '').replace(/0/g, '') !== ''
    );
  },
  (url, contractAddress) => `${url}_${contractAddress}`
);

export function getSafeHash(safe: SafeExecutionData) {
  const hashes = safe.txs.map(batch => batch.hash);
  const valid = hashes.every(hash => hash);
  if (!valid || !hashes.length) return null;
  return keccak256(['bytes32[]'], [hashes]);
}

export function validateSafeData(safe: SafeExecutionData) {
  return (
    safe.txs.length === 0 ||
    safe.txs
      .map(batch => batch.transactions)
      .flat()
      .every(tx => tx)
  );
}

export function isValidInput<Input extends { safes: SafeExecutionData[] }>(
  input: Input
) {
  return input.safes.every(validateSafeData);
}

export async function fetchTextSignatures(
  methodSignature: string
): Promise<string[]> {
  const url = new URL('/api/v1/signatures', 'https://www.4byte.directory');
  url.searchParams.set('hex_signature', methodSignature);
  url.searchParams.set('ordering', 'created_at');
  const response = await fetch(url.toString());
  const { results } = await response.json();
  return results.map(signature => signature.text_signature);
}
