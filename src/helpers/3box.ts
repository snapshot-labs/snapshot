import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

export async function getProfiles(addresses) {
  const profiles = await subgraphRequest('https://api.3box.io/graph', {
    profiles: {
      __args: {
        ids: addresses
      },
      name: true,
      eth_address: true,
      image: true
    }
  });

  const ensProfiles = await subgraphRequest(
    'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    {
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
    }
  );

  ensProfiles.accounts.forEach(account => {
    if (account.domains && account.domains.length > 0 && account.id) {
      const profileFoundIndex = profiles.profiles.findIndex(
        profile =>
          profile.eth_address.toLowerCase() === account.id.toLowerCase()
      );
      if (profileFoundIndex > -1) {
        if (!profiles.profiles[profileFoundIndex].name) {
          profiles.profiles[profileFoundIndex].name = account.domains[0].name;
        }
      } else {
        profiles.profiles.push({
          name: account.domains[0].name,
          eth_address: account.id,
          ens: true
        });
      }
    }
  });

  return profiles;
}
