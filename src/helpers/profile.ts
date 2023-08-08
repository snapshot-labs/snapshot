import { ens_normalize } from '@adraffy/ens-normalize';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import Multicaller from '@snapshot-labs/snapshot.js/src/utils/multicaller';
import { getAddress } from '@ethersproject/address';
import { resolveLensAddresses } from './lensResolver';

async function ensReverseRecordRequest(addresses) {
  const network = '1';
  const provider = getProvider(network);
  const abi = [
    'function getNames(address[] addresses) view returns (string[] r)'
  ];

  const reverseRecords = await call(
    provider,
    abi,
    ['0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', 'getNames', [addresses]],
    { blockTag: 'latest' }
  );
  const validNames = normalizeNames(reverseRecords);

  return Object.fromEntries(
    addresses.map((address, index) => {
      return [address, validNames[index]];
    })
  );
}

function normalizeNames(names: string[]) {
  return names.map(name => {
    try {
      return ens_normalize(name) === name ? name : '';
    } catch (e) {
      console.log(e);
      return '';
    }
  });
}

async function udReverseRecordRequest(addresses) {
  addresses = addresses.slice(0, 250);
  const network = '137';
  const abi = [
    'function reverseNameOf(address addr) view returns (string reverseUri)'
  ];

  try {
    const multi = new Multicaller(network, getProvider(network), abi);
    addresses.forEach(address => {
      address = getAddress(address);
      multi.call(
        `${address}`,
        '0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f',
        'reverseNameOf',
        [address]
      );
    });

    const names = await multi.execute();

    return Object.fromEntries(
      Object.entries(names).filter(([, name]) => !!name)
    );
  } catch (e) {
    return {};
  }
}

async function lookupAddresses(
  addresses: string[]
): Promise<{ [k: string]: string }> {
  const [ens, ud, lens] = await Promise.all([
    ensReverseRecordRequest(addresses),
    udReverseRecordRequest(addresses),
    resolveLensAddresses(addresses)
  ]);

  return Object.fromEntries(
    addresses.map(address => {
      const normalizedAddress = getAddress(address);
      return [
        address,
        ens[normalizedAddress] ||
          lens[normalizedAddress] ||
          ud[normalizedAddress] ||
          ''
      ];
    })
  );
}

export async function getEnsAddress(
  addresses: string[]
): Promise<{ [k: string]: string } | null> {
  addresses = addresses.slice(0, 250);
  try {
    return await lookupAddresses(addresses);
  } catch (e) {
    console.log(e);
    return null;
  }
}
