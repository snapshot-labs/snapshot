import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useModal } from '@/composables/useModal';
import client from '@/helpers/EIP712';

export function useFollowSpace() {
  const auth = getInstance();
  const store = useStore();

  const loading = ref(false);

  const { modalAccountOpen } = useModal();

  const web3Account = computed(() => store.state.web3.account);

  function clickFollow(space) {
    !store.state.app.authLoading
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
