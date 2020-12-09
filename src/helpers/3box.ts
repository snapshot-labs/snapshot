import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

function get3BoxProfiles(addresses) {
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

function lookupAddresses(addresses) {
  return subgraphRequest(
    'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
    {
      accounts: {
        __args: {
          first: 1000,
          where: {
            id_in: addresses.map(addresses => addresses.toLowerCase())
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
}

export async function getProfiles(addresses) {
  let ensNames: any = { accounts: [] };
  let _3BoxProfiles: any = { profiles: [] };
  try {
    [ensNames, _3BoxProfiles] = await Promise.all([
      lookupAddresses(addresses),
      get3BoxProfiles(addresses)
    ]);
  } catch (e) {
    console.log(e);
  }

  console.log(ensNames, _3BoxProfiles);
  const profiles = Object.fromEntries(addresses.map(address => [address, {}]));
  return Object.fromEntries(
    Object.entries(profiles).map(([address, profile]) => {
      profile =
        _3BoxProfiles.profiles.find(
          profile => profile.eth_address === address.toLowerCase()
        ) || {};
      const ensAccount = ensNames.accounts.find(
        profile => profile.id === address.toLowerCase()
      );
      profile.ens =
        (ensAccount &&
          ensAccount.domains &&
          ensAccount.domains.length > 0 &&
          ensAccount.domains[0].name) ||
        '';
      return [address, profile];
    })
  );
  return profiles;
}
