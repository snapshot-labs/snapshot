import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';

function get3BoxProfiles(addresses) {
  return new Promise((resolove, reject) => {
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
      .then(({ profiles }) => {
        const _3BoxProfiles = {};
        profiles.forEach(profile => {
          _3BoxProfiles[profile.eth_address.toLowerCase()] = profile;
        });
        resolove(_3BoxProfiles);
      })
      .catch(error => {
        reject(error);
      });
  });
}

function lookupAddresses(addresses) {
  return new Promise((resolove, reject) => {
    subgraphRequest('https://api.thegraph.com/subgraphs/name/ensdomains/ens', {
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
          name: true,
          labelName: true
        }
      }
    })
      .then(({ accounts }) => {
        const ensNames = {};
        accounts.forEach(profile => {
          ensNames[profile.id.toLowerCase()] = profile?.domains?.[0]?.labelName
            ? profile.domains[0].name
            : '';
        });
        resolove(ensNames);
      })
      .catch(error => {
        reject(error);
      });
  });
}

export async function getProfiles(addresses) {
  let ensNames: any = {};
  let _3BoxProfiles: any = {};
  try {
    [ensNames, _3BoxProfiles] = await Promise.all([
      lookupAddresses(addresses),
      get3BoxProfiles(addresses)
    ]);
  } catch (e) {
    console.log(e);
  }

  const profiles = Object.fromEntries(addresses.map(address => [address, {}]));
  return Object.fromEntries(
    Object.entries(profiles).map(([address, profile]) => {
      profile = _3BoxProfiles[address.toLowerCase()] || {};
      profile.ens = ensNames[address.toLowerCase()] || '';
      return [address, profile];
    })
  );
}
