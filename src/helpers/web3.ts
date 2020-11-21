import { bufferToHex } from 'ethereumjs-util';
import {
  resolveENSContentHash,
  decodeContenthash
} from '@snapshot-labs/snapshot.js/src/utils/contentHash';

export async function resolveContent(provider, name) {
  const contentHash = await resolveENSContentHash(name, provider);
  return decodeContenthash(contentHash);
}

export async function signMessage(web3, msg, address) {
  msg = bufferToHex(new Buffer(msg, 'utf8'));
  return await web3.send('personal_sign', [msg, address]);
}

export async function getBlockNumber(provider) {
  try {
    const blockNumber: any = await provider.getBlockNumber();
    return parseInt(blockNumber);
  } catch (e) {
    return Promise.reject();
  }
}
