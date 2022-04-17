import { getEnsAddress } from '@/helpers/profile';
import { ref } from 'vue';

// Holds profile data (ENS name, username, about, twitter) for all addresses appearing in the frontend
const profiles = ref<{
  [address: string]: {
    ens: string;
    name?: string;
    about?: string;
    twitter?: string;
  };
}>({});

export function useProfiles() {
  /**
   * Populates global ref with profile data for batches of addresses.
   */
  const loadProfiles = async (addresses: string[]) => {
    const addressesToAdd = addresses.filter(
      address =>
        !Object.keys(profiles.value).includes(address) && address !== ''
    );

    let response: any = {};
    if (addressesToAdd.length > 0) {
      response = await Promise.all([
        await getEnsAddress(addressesToAdd),
        // Example object
        // TODO: Remove this example and replay with profile query
        {
          '0xF78108c9BBaF466dd96BE41be728Fe3220b37119': {
            name: 'test1'
          }
        }
      ]);
      // add ens from response to corresponding address in profilesObj
      Object.keys(response[0]).forEach(address => {
        response[0][address] = {
          ...{ ens: response[0][address] },
          ...response[1][address]
        };
      });
    }

    profiles.value = { ...response[0], ...profiles.value };
  };

  return {
    profiles,
    loadProfiles
  };
}
