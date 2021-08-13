import { computed, ref, onMounted, watchEffect } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import client from '@/helpers/EIP712';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { useAliasAction } from '@/composables/useAliasAction';

const follows: any = ref({});

export function useFollowSpace(spaceObj) {
  const auth = getInstance();
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

  watchEffect(() => {
    (isFollowing.value = (follows.value?.[spaceObj.key] ?? []).some(
      (f: any) => f.follower === web3Account.value
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

  const { setAlias, aliasWallet } = useAliasAction();
  async function follow(space) {
    if (!aliasWallet.value) setAlias();
    else {
      console.log(aliasWallet.value);
      loading.value = true;
      try {
        if (isFollowing.value) {
          await client.unfollow(auth.web3, web3Account.value, {
            space
          });
          isFollowing.value = false;
        } else {
          await client.follow(auth.web3, web3Account.value, {
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
