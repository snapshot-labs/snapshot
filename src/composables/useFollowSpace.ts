import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import client from '@/helpers/clientEIP712';
import { useSpaceSubscription } from './useSpaceSubscription';

const following = ref([]);
const loadingFollows = ref(false);

export function useFollowSpace(spaceId: any = {}) {
  const { web3, web3Account } = useWeb3();
  const { modalAccountOpen } = useModal();
  const { apolloQuery } = useApolloQuery();
  const { setAlias, aliasWallet, isValidAlias, checkAlias } = useAliasAction();
  const { toggleSubscription, isSubscribed } = useSpaceSubscription(spaceId);
  const { notify } = useFlashNotification();
  const { t } = useI18n();

  const loadingFollow = ref('');

  const followingSpaces = computed(() =>
    Array.isArray(following.value)
      ? following.value.map((f: any) => f.space.id)
      : []
  );

  const isFollowing = computed(() =>
    following.value.some(
      (f: any) => f.space.id === spaceId && f.follower === web3Account.value
    )
  );

  async function loadFollows(spaceId?: string) {
    const { isAuthenticated } = getInstance();

    if (!isAuthenticated.value) return;

    loadingFollows.value = true;
    try {
      following.value = await apolloQuery(
        {
          query: FOLLOWS_QUERY,
          variables: {
            follower_in: web3Account.value,
            space_in: spaceId ? [spaceId] : undefined
          }
        },
        'follows'
      );
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
    loadingFollow.value = spaceId;

    try {
      await checkAlias();
      if (!aliasWallet.value || !isValidAlias.value) {
        await setAlias();
        follow(space);
      } else {
        const network = process.env.VITE_ENV === 'production' ? 's' : 's-tn';

        if (isFollowing.value) {
          // Also unsubscribe to the notifications if the user leaves the space.
          if (isSubscribed.value) {
            await toggleSubscription();
          }
          await client.unfollow(aliasWallet.value, aliasWallet.value.address, {
            from: web3Account.value,
            space,
            network
          });
        } else {
          await client.follow(aliasWallet.value, aliasWallet.value.address, {
            from: web3Account.value,
            space,
            network
          });
        }
        await loadFollows();
        loadingFollow.value = '';
      }
    } catch (e: any) {
      loadingFollow.value = '';
      console.error(e);
      notify([
        'red',
        e?.error_description
          ? `Oops, ${e.error_description}`
          : t('notify.somethingWentWrong')
      ]);
    }
  }

  return {
    clickFollow,
    loadFollows,
    loadingFollow: computed(() => loadingFollow.value),
    loadingFollows: computed(() => loadingFollows.value),
    isFollowing,
    followingSpaces
  };
}
