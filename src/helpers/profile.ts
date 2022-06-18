import namehash from '@ensdomains/eth-ens-namehash';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { call } from '@snapshot-labs/snapshot.js/src/utils';

function ensReverseRecordRequest(addresses) {
  const network = '1';
  const provider = getProvider(network, 'brovider');
  const abi = [
    'function getNames(address[] addresses) view returns (string[] r)'
  ];
  return call(
    provider,
    abi,
    ['0x3671aE578E63FdF66ad4F3E12CC0c0d71Ac7510C', 'getNames', [addresses]],
    { blockTag: 'latest' }
  );
}

function lookupAddresses(
  addresses: string[]
): Promise<{ [k: string]: string }> {
  return new Promise((resolove, reject) => {
    ensReverseRecordRequest(addresses)
      .then(reverseRecords => {
        const validNames = reverseRecords.map(n =>
          namehash.normalize(n) === n ? n : ''
        );
        const ensNames = Object.fromEntries(
          addresses.map((address, index) => {
            return [address, validNames[index]];
          })
        );

        resolove(ensNames);
      })
      .catch(error => {
        reject(error);
      });
  });
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
