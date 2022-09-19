import { computed, Ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { Profile } from '@/helpers/interfaces';

import { useWeb3 } from '@/composables';

export function useUsername(
  address: Ref<string>,
  profile?: Ref<Profile | undefined>
) {
  const { web3Account } = useWeb3();

  const username = computed(() => {
    if (
      web3Account &&
      address.value.toLowerCase() === web3Account.value.toLowerCase()
    ) {
      return 'You';
    }

    if (profile?.value?.name) return profile.value.name;
    if (profile?.value?.ens) return profile.value.ens;
    return shorten(address.value);
  });

  return {
    username
  };
}
