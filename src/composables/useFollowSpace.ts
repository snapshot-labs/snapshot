import { computed, ref, onMounted, watchEffect } from 'vue';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { useAliasAction } from '@/composables/useAliasAction';
import client from '@/helpers/EIP712';

const follows: any = ref({});

export function useFollowSpace(spaceObj) {
  const { web3 } = useWeb3();
  const { modalAccountOpen } = useModal();

  const loading = ref(false);
  const loadingAllFollows = ref(false);
  const isFollowing = ref(false);

  const web3Account = computed(() => web3.value.account);

  onMounted(async () => {
    loadingAllFollows.value = true;
    await loadFollows();
    loadingAllFollows.value = false;
  });

  const { apolloQuery } = useApolloQuery();
  async function loadFollows() {
    try {
      follows.value[spaceObj.key] = await apolloQuery(
        {
          query: FOLLOWS_QUERY,
          variables: {
            space_in: spaceObj.key
          }
        },
        'follows'
      );
    } catch (e) {
      console.error(e);
    }
  }

  const { setAlias, aliasWallet } = useAliasAction();

  watchEffect(() => {
    (isFollowing.value = (follows.value?.[spaceObj.key] ?? []).some(
      (f: any) => f.follower === aliasWallet.value?.address
    )),
      { deep: true };
  });

  function clickFollow(space) {
    !web3.value.authLoading
      ? web3Account.value
        ? follow(space)
        : (modalAccountOpen.value = true)
      : null;
  }

  async function follow(space) {
    loading.value = true;
    if (!aliasWallet.value) {
      await setAlias();
      follow(space);
    } else {
      try {
        if (isFollowing.value) {
          await client.unfollow(aliasWallet.value, aliasWallet.value.address, {
            space
          });
          isFollowing.value = false;
        } else {
          await client.follow(aliasWallet.value, aliasWallet.value.address, {
            space
          });
          isFollowing.value = true;
        }
        loading.value = false;
      } catch (e) {
        loading.value = false;
        console.error(e);
      }
    }
  }

  return {
    clickFollow,
    loadingFollow: computed(() => loading.value),
    isFollowing,
    loadingAllFollows
  };
}
