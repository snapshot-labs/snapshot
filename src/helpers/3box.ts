import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

export async function getProfiles(addresses) {
  return subgraphRequest('https://api.3box.io/graph', {
    profiles: {
      __args: {
        ids: addresses
      },
      name: true,
      eth_address: true,
      image: true
    }
  });
}
