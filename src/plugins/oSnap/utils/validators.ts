import { isAddress } from '@ethersproject/address';
import { JsonRpcProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import memoize from 'lodash/memoize';
import { Contract } from '@ethersproject/contracts';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { isHexString } from '@ethersproject/bytes';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { OPTIMISTIC_GOVERNOR_ABI } from '../constants';
import { BaseTransaction } from '../types';

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

export function validateTransaction(transaction: BaseTransaction) {
  const addressEmptyOrValidate =
    transaction.to === '' || isAddress(transaction.to);
  return (
    isBigNumberish(transaction.value) &&
    addressEmptyOrValidate &&
    (!transaction.data || isHexString(transaction.data))
  );
}

export async function validateModuleAddress(network: string, moduleAddress: string): Promise<boolean> {
  if (!isAddress(moduleAddress)) return false;
  const provider: StaticJsonRpcProvider = getProvider(network);
  const moduleContract = new Contract(moduleAddress, OPTIMISTIC_GOVERNOR_ABI, provider);

  return moduleContract
    .rules()
    .then(() => true)
    .catch(() => false);
}