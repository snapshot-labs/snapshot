import { profileGraphQL } from '3box/lib/api';

export async function getProfiles(addresses) {
  return profileGraphQL(`
    query getProfiles { 
      profiles (ids: ${JSON.stringify(addresses)}) {
        name, 
        eth_address
        image
      }
    }
  `);
}
