import { namehash } from '@ethersproject/hash';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import utils from '@snapshot-labs/snapshot.js/src/utils';

export async function getSpaceUri(id) {
  const abi =
    'function text(bytes32 node, string calldata key) external view returns (string memory)';
  const address = '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41';

  let uri: any = false;
  try {
    const hash = namehash(id);
    const provider = getProvider('1');
    uri = await utils.call(
      provider,
      [abi],
      [address, 'text', [hash, 'snapshot']]
    );
  } catch (e) {
    console.log('getSpaceUriFromTextRecord failed', id, e);
  }
  return uri;
}
