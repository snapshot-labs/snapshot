const get = () => import(/* webpackChunkName: "ens" */ '@ensdomains/ensjs');
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { resolveContent } from '@snapshot-labs/snapshot.js/src/utils/contentHash';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';

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
  let uri: any = false;
  try {
    const ensAddress = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
    const ENS = (await get()).default;
    const ens = new ENS({ provider: getProvider('1'), ensAddress });
    uri = await ens.name(id).getText('snapshot');
  } catch (e) {
    console.log('getSpaceUriFromTextRecord failed', id, e);
  }
  return uri;
}

export async function getSpaceUri(id) {
  let uri = await getSpaceUriFromTextRecord(id);
  if (!uri) uri = await getSpaceUriFromContentHash(id);
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
