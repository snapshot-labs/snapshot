import { lookupAddress } from '@/helpers/utils';
import { PROFILES_QUERY } from '@/helpers/queries';
import { Profile } from '@/helpers/interfaces';
import { getAddress } from '@ethersproject/address';

// Holds profile data (ENS name, username, about) for all addresses appearing in the frontend
const profiles = ref<{
  [address: string]: Profile;
}>({});

const reloadingProfile = ref(false);

export function useProfiles() {
  const loadingProfiles = ref(false);

  const profilesCreated = computed(() => {
    const profilesWithCreatedAndAvatar = Object.values(profiles.value).filter(
      profile => profile.avatar && profile.created
    );
    const profilesCreatedWithinLastWeek = profilesWithCreatedAndAvatar.filter(
      profile => profile.created ?? 0 > Date.now() - 1000 * 60 * 60 * 24 * 7
    );
    const addressCreatedObject = profilesCreatedWithinLastWeek.reduce(
      (acc, profile) => ({ ...acc, [profile.id as string]: profile.created }),
      {}
    );
    return addressCreatedObject;
  });

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
      loadingProfiles.value = true;
      profilesRes = await Promise.all([
        await lookupAddress(addressesToAdd),
        await apolloQuery(
          {
            query: PROFILES_QUERY,
            variables: {
              addresses
            }
          },
          'users'
        )
      ]);
      // add ens from profilesRes to corresponding address in profilesObj
      Object.keys(profilesRes[0] ?? {}).forEach(address => {
        profilesRes[0][address] = {
          ...{ ens: profilesRes[0][address] },
          ...profilesRes[1]?.find(p => p.id === address)
        };
      });
    }

    profiles.value = { ...profilesRes[0], ...profiles.value };
    loadingProfiles.value = false;
    reloadingProfile.value = false;
  };

  // Reload a profile in profiles object
  const reloadProfile = (address: string) => {
    // find profile in profiles object and delete it (to force reload)
    const profile = profiles.value[address];
    if (profile) {
      delete profiles.value[address];
    }
    reloadingProfile.value = true;
    loadProfiles([address]);
  };

  function getProfile(address: string) {
    const normalizedAddress = getAddress(address);
    return profiles.value[normalizedAddress];
  }

  return {
    profiles,
    loadProfiles,
    reloadProfile,
    getProfile,
    loadingProfiles,
    reloadingProfile,
    profilesCreated
  };
}
