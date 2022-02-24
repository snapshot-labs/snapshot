import { computed, ref } from 'vue';
import { shorten } from '@/helpers/utils';
import { useWeb3 } from '@/composables/useWeb3';

export function useUsername() {
  const { web3Account } = useWeb3();

  const address = ref('');
  const profile = ref({
    name: '',
    ens: ''
  });

  const fullUserName = ref('');

  const username = computed(() => {
    if (
      web3Account.value &&
      address.value.toLowerCase() === web3Account.value.toLowerCase()
    ) {
      fullUserName.value = 'You';
      return 'You';
    }
    if (profile.value?.name) {
      fullUserName.value = profile.value.name;
      return profile.value.name;
    } else if (profile.value?.ens) {
      fullUserName.value = profile.value.ens;
      return shorten(profile.value.ens, 20);
    }
    fullUserName.value = address.value;
    return shorten(address.value);
  });

  return { address, profile, username, fullUserName };
}
