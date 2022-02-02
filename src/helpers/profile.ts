import namehash from '@ensdomains/eth-ens-namehash';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { call } from '@snapshot-labs/snapshot.js/src/utils';

function ensReverseRecordRequest(addresses) {
  const network = '1';
  const provider = getProvider(network);
  const abi = [
    {
      inputs: [
        { internalType: 'address[]', name: 'addresses', type: 'address[]' }
      ],
      name: 'getNames',
      outputs: [{ internalType: 'string[]', name: 'r', type: 'string[]' }],
      stateMutability: 'view',
      type: 'function'
    }
  ];
  return call(
    provider,
    abi,
    ['0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', 'getNames', [addresses]],
    { blockTag: 'latest' }
  );
}

function lookupAddresses(addresses) {
  return new Promise((resolove, reject) => {
    ensReverseRecordRequest(addresses)
      .then(reverseRecords => {
        const validNames = reverseRecords.map(n =>
          namehash.normalize(n) === n ? n : ''
        );
        const ensNames = Object.fromEntries(
          addresses.map((address, index) => {
            return [address.toLowerCase(), validNames[index]];
          })
        );

        resolove(ensNames);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export async function getProfiles(addresses) {
  addresses = addresses.slice(0, 250);
  let ensNames: any = {};
  try {
    ensNames = await lookupAddresses(addresses);
  } catch (e) {
    console.log(e);
  }

  const profiles = Object.fromEntries(addresses.map(address => [address, {}]));
  return Object.fromEntries(
    Object.entries(profiles).map(([address, profile]) => {
      profile = {};
      profile.ens = ensNames[address.toLowerCase()] || '';
      if (profile.ens) {
        profile.name = profile.ens;
        profile.image = `https://metadata.ens.domains/mainnet/avatar/${profile.ens}`;
      }
      return [address, profile];
    })
  );
}

export async function ensTextRecord(ens: string, record: string) {
  const hash = namehash.hash(ens);
  const provider = getProvider('1');
  const abi = [
    {
      constant: true,
      inputs: [
        { internalType: 'bytes32', name: 'node', type: 'bytes32' },
        { internalType: 'string', name: 'key', type: 'string' }
      ],
      name: 'text',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ];
  return call(
    provider,
    abi,
    ['0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41', 'text', [hash, record]],
    { blockTag: 'latest' }
  );
}
