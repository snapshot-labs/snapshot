import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { _shorten } from '@/helpers/utils';

export function useUsername() {
  const store = useStore();

  const address = ref('');
  const profile = ref({
    name: '',
    ens: ''
  });

  const web3Account = computed(() => store.state.web3.account);

  const name = computed(() => {
    if (
      web3Account.value &&
      address.value.toLowerCase() === web3Account.value.toLowerCase()
    ) {
      return 'You';
    }
    if (profile.value?.name) {
      return profile.value.name;
    } else if (profile.value?.ens) {
      return _shorten(profile.value.ens, 20);
    }
    return _shorten(address.value);
  });

  return { address, profile, name };
}
