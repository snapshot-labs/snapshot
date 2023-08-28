import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Multicaller from '@snapshot-labs/snapshot.js/src/utils/multicaller';
import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';

type Handle = string;
type Address = string;
type ProfileId = number;

const network = '137';
const abi: string[] = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function getHandle(uint256 profileId) view returns (string)'
];
const contractAddress = '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d';

class LensResolver {
  _multicaller!: Multicaller;

  get multi() {
    if (!this._multicaller) {
      const broviderUrl = import.meta.env.VITE_BROVIDER_URL;
      const provider = getProvider(network, { broviderUrl });
      this._multicaller = new Multicaller(network, provider, abi);
    }
    return this._multicaller;
  }

  async getAvailableHandleMapping(addresses: Address[]): Promise<Address[]> {
    if (!addresses.length) return [];
    addresses.forEach(address => {
      address = getAddress(address).toString();
      this.multi.call(address, contractAddress, 'balanceOf', [address]);
    });

    const balances: Record<Address, BigNumber> = await this.multi.execute();
    return Object.entries(balances)
      .map(([addr, bal]): [Address, number] => [addr, bal.toNumber()])
      .filter(([addr, bal]) => !!bal && addr !== 'undefined')
      .map(([addr]) => addr);
  }

  async getTokensMapping(
    addresses: Address[]
  ): Promise<[Address, ProfileId][]> {
    if (!addresses.length) return [];
    addresses.forEach(address => {
      address = getAddress(address).toString();
      this.multi.call(address, contractAddress, 'tokenOfOwnerByIndex', [
        address,
        0
      ]);
    });

    const tokens: Record<Address, BigNumber> = await this.multi.execute();

    return Object.entries(tokens).map(([address, token]) => [
      address,
      token.toNumber()
    ]);
  }

  async getHandleMapping(
    tokenMapping: [Address, ProfileId][]
  ): Promise<Record<Address, Handle>> {
    if (!tokenMapping.length) return {};
    tokenMapping.forEach(([address, token]) => {
      this.multi.call(address, contractAddress, 'getHandle', [token]);
    });

    const handles: Record<Address, Handle> = await this.multi.execute();

    return Object.entries(handles)
      .filter(([address]) => address !== 'undefined')
      .map(([address, handle]) => [address, handle.toString()])
      .reduce((acc, [address, handle]) => {
        acc[address] = handle;
        return acc;
      }, {});
  }

  async resolveAddresses(
    addresses: Address[]
  ): Promise<Record<Address, Handle>> {
    const addressesWithHandles = await this.getAvailableHandleMapping(
      addresses
    );
    const tokenMapping = await this.getTokensMapping(addressesWithHandles);
    return this.getHandleMapping(tokenMapping);
  }
}

export const resolveLensAddresses = async (addresses: Address[]) => {
  const resolver = new LensResolver();
  return await resolver.resolveAddresses(addresses);
};
