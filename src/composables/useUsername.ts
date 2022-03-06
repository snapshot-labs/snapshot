import { computed, ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';

export function useUsername() {
  const { web3Account } = useWeb3();

  const address = ref('');
  const profile = ref<{ name?: string; ens?: string } | null>(null);

  const username = computed(() => {
    if (
      web3Account.value &&
      address.value.toLowerCase() === web3Account.value.toLowerCase()
    ) {
      return 'You';
    }
    if (profile.value?.name) {
      return profile.value.name;
    } else if (profile.value?.ens) {
      return profile.value.ens;
    }
    return shorten(address.value);
  });

  function setAddress(a) {
    address.value = a ? a : '';
  }

  function setProfile(p) {
    profile.value = p ? p : null;
  }

  return {
    address: computed(() => address.value),
    profile: computed(() => profile.value),
    username,
    setAddress,
    setProfile
  };
}
