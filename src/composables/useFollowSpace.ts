import { computed, ref } from 'vue';
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { useAliasAction } from '@/composables/useAliasAction';
import client from '@/helpers/EIP712';

// const spaceFollows: any = ref({});
const following = ref([]);
const loadingFollows = ref(false);

export function useFollowSpace(spaceObj: any = {}) {
  const { web3 } = useWeb3();
  const { modalAccountOpen } = useModal();
  const { apolloQuery } = useApolloQuery();
  const { setAlias, aliasWallet, isValidAlias, checkAlias } = useAliasAction();

  const loadingFollow = ref('');
  const hoverJoin = ref('');

  const web3Account = computed(() => web3.value.account);

  const followingSpaces = computed(() =>
    following.value.map((f: any) => f.space.id)
  );

  const isFollowing = computed(() =>
    following.value.some(
      (f: any) =>
        f.space.id === spaceObj?.id && f.follower === web3Account.value
    )
  );

  async function loadFollows() {
    const { isAuthenticated } = getInstance();

    if (!isAuthenticated.value) return;

    loadingFollows.value = true;
    try {
      Promise.all([
        // Hint: Saving this for when we want to show how many users follow a space.

        // (spaceFollows.value[spaceObj.id] = await apolloQuery(
        //   {
        //     query: FOLLOWS_QUERY,
        //     variables: {
        //       space_in: spaceObj.id
        //     }
        //   },
        //   'follows'
        // )),
        (following.value = await apolloQuery(
          {
            query: FOLLOWS_QUERY,
            variables: {
              follower_in: web3Account.value
            }
          },
          'follows'
        ))
      ]);
      loadingFollows.value = false;
    } catch (e) {
      loadingFollows.value = false;
      console.error(e);
    }
  }

  function clickFollow(space) {
    !web3.value.authLoading
      ? web3Account.value
        ? follow(space)
        : (modalAccountOpen.value = true)
      : null;
  }

  async function follow(space) {
    loadingFollow.value = spaceObj.id;
    try {
      await checkAlias();
      if (!aliasWallet.value || !isValidAlias.value) {
        await setAlias();
        follow(space);
      } else {
        if (isFollowing.value) {
          await client.unfollow(aliasWallet.value, aliasWallet.value.address, {
            from: web3Account.value,
            space
          });
        } else {
          await client.follow(aliasWallet.value, aliasWallet.value.address, {
            from: web3Account.value,
            space
          });
        }
        await loadFollows();
        loadingFollow.value = '';
      }
    } catch (e) {
      loadingFollow.value = '';
      console.error(e);
    }
  }

  // watchEffect(async () => {
  //   (isFollowing.value = (following.value ?? []).some(
  //     (f: any) =>
  //       f.space.id === spaceObj?.id && f.follower === web3Account.value
  //   )),
  //     { deep: true };
  // });

  return {
    clickFollow,
    loadFollows,
    loadingFollow: computed(() => loadingFollow.value),
    loadingFollows: computed(() => loadingFollows.value),
    isFollowing,
    followingSpaces,
    hoverJoin
  };
}
