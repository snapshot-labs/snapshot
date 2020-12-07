import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

export async function getProfiles(addresses) {
  const [ensProfiles, threeBoxProfiles] = await Promise.all([
    subgraphRequest('https://api.thegraph.com/subgraphs/name/ensdomains/ens', {
      accounts: {
        __args: {
          first: 1000,
          where: {
            id_in: addresses.map(address => address.toLowerCase())
          }
        },
        id: true,
        domains: {
          __args: {
            first: 1
          },
          name: true
        }
      }
    }),
    subgraphRequest('https://api.3box.io/graph', {
      profiles: {
        __args: {
          ids: addresses
        },
        name: true,
        eth_address: true,
        image: true
      }
    })
  ]);

  const profiles = {};
  addresses.forEach(address => {
    profiles[address] = {};
    const profileFoundIndex = threeBoxProfiles.profiles.findIndex(
      profile => profile.eth_address.toLowerCase() === address.toLowerCase()
    );
    if (profileFoundIndex > -1) {
      const { name, image } = threeBoxProfiles.profiles[profileFoundIndex];
      if (name) {
        profiles[address].name = name;
      }
      if (image) {
        profiles[address].image = image;
      }
    }
    const ensProfileFoundIndex = ensProfiles.accounts.findIndex(
      profile => profile.id.toLowerCase() === address.toLowerCase()
    );
    if (
      ensProfileFoundIndex > -1 &&
      ensProfiles.accounts[ensProfileFoundIndex].domains &&
      ensProfiles.accounts[ensProfileFoundIndex].domains.length > 0
    ) {
      const { name } = ensProfiles.accounts[ensProfileFoundIndex].domains[0];
      profiles[address].ens = name;
    }
  });

  return profiles;
}
