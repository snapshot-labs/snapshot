import namehash from '@ensdomains/eth-ens-namehash';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import { getAddress } from '@ethersproject/address';

const UD_TOKEN = '5dpellhz6ma2rxcz9g5us82jh50x46sy';

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
  const validNames = reverseRecords.map(n =>
    namehash.normalize(n) === n ? n : ''
  );

  return Object.fromEntries(
    addresses.map((address, index) => {
      return [address, validNames[index]];
    })
  );
}

async function udReverseRecordRequest(addresses) {
  addresses = [...new Set(addresses)];

  try {
    const res = await fetch(
      `https://resolve.unstoppabledomains.com/reverse/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${UD_TOKEN}`
        },
        body: JSON.stringify({ addresses })
      }
    );
    const data = await res.json();

    return Object.fromEntries(
      data?.data?.map(item => {
        return [getAddress(item.meta.owner), item.meta.domain];
      })
    );
  } catch (e) {
    return {};
  }
}

async function lookupAddresses(
  addresses: string[]
): Promise<{ [k: string]: string }> {
  const [ens, ud] = await Promise.all([
    ensReverseRecordRequest(addresses),
    udReverseRecordRequest(addresses)
  ]);

  return Object.fromEntries(
    addresses.map(address => {
      return [address, ens[address] || ud[address] || ''];
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
