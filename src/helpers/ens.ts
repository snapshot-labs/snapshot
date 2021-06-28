import { namehash } from '@ethersproject/hash';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { resolveContent } from '@snapshot-labs/snapshot.js/src/utils/contentHash';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';
import utils from '@snapshot-labs/snapshot.js/src/utils';

const gateway = process.env.VUE_APP_IPFS_GATEWAY || gateways[0];

export async function uriGet(
  gateway: string,
  key: string,
  protocolType = 'ipfs'
) {
  key = key.replace(
    'storage.snapshot.page',
    'storageapi.fleek.co/snapshot-team-bucket'
  );
  if (key.includes('storageapi.fleek.co')) protocolType = 'https';
  let url = `https://${gateway}/${protocolType}/${key}`;
  if (['https', 'http'].includes(protocolType))
    url = `${protocolType}://${key}`;
  return fetch(url).then(res => res.json());
}

export async function getSpaceUriFromContentHash(id) {
  let uri: any = false;
  try {
    const { protocolType, decoded } = await resolveContent(
      getProvider('1'),
      id
    );
    if (protocolType && decoded) uri = `${protocolType}://${decoded}`;
  } catch (e) {
    console.log('getSpaceUriFromContentHash failed', id, e);
  }
  return uri;
}

export async function getSpaceUriFromTextRecord(id) {
  const REGISTRAR_ABI = [
    {
      constant: true,
      inputs: [
        {
          name: 'node',
          type: 'bytes32'
        }
      ],
      name: 'resolver',
      outputs: [
        {
          name: 'resolverAddress',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ];

  const RESOLVER_ABI = [
    {
      constant: true,
      inputs: [
        {
          internalType: 'bytes32',
          name: 'node',
          type: 'bytes32'
        },
        {
          internalType: 'string',
          name: 'key',
          type: 'string'
        }
      ],
      name: 'text',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ];
  
  const REGISTRAR_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
  let uri: any = false;
  try {
    const hash = namehash(id);
    const provider = getProvider('1');
    const resolverAddress = await utils.call(provider, REGISTRAR_ABI, [
      REGISTRAR_ADDRESS,
      'resolver',
      [hash]
    ]);
    uri = await utils.call(provider, RESOLVER_ABI, [
      resolverAddress,
      'text',
      [hash, 'snapshot']
    ]);
  } catch (e) {
    console.log('getSpaceUriFromTextRecord failed', id, e);
  }
  return uri;
}

export async function getSpaceUri(id) {
  console.log(id);
  let uri = await getSpaceUriFromTextRecord(id);
  if (!uri) uri = await getSpaceUriFromContentHash(id);
  console.log(uri);
  return uri;
}

export async function getSpace(id) {
  let space = false;
  const uri: any = await getSpaceUri(id);
  if (uri) {
    try {
      const [protocolType, key] = uri.split('://');
      space = await uriGet(gateway, key, protocolType);
    } catch (e) {
      console.log('getSpace failed', id, e);
    }
  }
  return space;
}
