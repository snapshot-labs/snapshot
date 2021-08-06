import { computed, ref } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import client from '@/helpers/EIP712';

export function useFollowSpace() {
  const auth = getInstance();
  const { web3 } = useWeb3();
  const { modalAccountOpen } = useModal();

  const loading = ref(false);

  const web3Account = computed(() => web3.value.account);

  function clickFollow(space) {
    !web3.value.authLoading
      ? web3Account.value
        ? follow(space)
        : (modalAccountOpen.value = true)
      : null;
  }

  async function follow(space) {
    loading.value = true;
    try {
      await client.follow(auth.web3, web3Account.value, { space });
      loading.value = false;
    } catch (e) {
      loading.value = false;
      console.error(e);
    }
  }

  return { clickFollow, loadingFollow: computed(() => loading) };
}
