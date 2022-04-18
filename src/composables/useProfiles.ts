import { getEnsAddress } from '@/helpers/profile';
import { ref } from 'vue';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { PROFILES_QUERY } from '@/helpers/queries';
import client from '@/helpers/clientEIP712';
import { useAliasAction } from '@/composables/useAliasAction';

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

    const { apolloQuery } = useApolloQuery();
    let profilesRes: any = {};
    if (addressesToAdd.length > 0) {
      profilesRes = await Promise.all([
        await getEnsAddress(addressesToAdd),
        // Example object
        // TODO: Remove this example and replay with profile query
        await apolloQuery(
          {
            query: PROFILES_QUERY,
            variables: {
              addresses: addresses
            }
          },
          'profiles'
        )
      ]);
      // add ens from profilesRes to corresponding address in profilesObj
      Object.keys(profilesRes[0]).forEach(address => {
        profilesRes[0][address] = {
          ...{ ens: profilesRes[0][address] },
          ...profilesRes[1]?.[address]
        };
      });
    }

    profiles.value = { ...profilesRes[0], ...profiles.value };
  };

  // Function to reload a profile in profiles object
  const reloadProfile = (address: string) => {
    // find profile in profiles object and delete it (to force reload)
    const profile = profiles.value[address];
    if (profile) {
      delete profiles.value[address];
    }
    loadProfiles([address]);
  };

  // Function to save a profile on the hub with alias
  const { setAlias, aliasWallet, isValidAlias, checkAlias } = useAliasAction();
  const saveProfile = async (
    profile: { name: string; about: string; avatar: string; twitter: string },
    web3Account: string
  ) => {
    await client.profile(aliasWallet.value, aliasWallet.value.address, {
      from: web3Account,
      timestamp: Number((Date.now() / 1e3).toFixed()),
      profile: JSON.stringify(profile)
    });
  };

  return {
    profiles,
    loadProfiles,
    reloadProfile,
    saveProfile
  };
}
