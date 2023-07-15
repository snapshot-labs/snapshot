<script setup lang="ts">
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { getUserNfts } from '@/helpers/nftClaimer';

const props = defineProps<{
  userAddress: string;
  profile?: { about?: string };
}>();

const { apolloQuery } = useApolloQuery();
const { loadSpaces, spaces } = useSpaces();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();

const followingSpaceIds = ref<string[]>([]);
const nfts = ref<any[]>([]);
const isLoading = ref(false);

async function loadSpacesFollowed() {
  try {
    const response = await apolloQuery(
      {
        query: FOLLOWS_QUERY,
        variables: {
          follower_in: props.userAddress
        }
      },
      'follows'
    );

    followingSpaceIds.value = response.map(f => f.space.id);
  } catch (e) {
    console.error(e);
  }
}

async function loadNFTClaimer() {
  nfts.value = await getUserNfts(props.userAddress);
}

const domainsWithExistingSpace = computed(() => {
  const ownedEnsNames = ownedEnsDomains.value.map(d => d.name);
  return spaces.value.filter(d => ownedEnsNames.includes(d.id));
});

const followingSpaces = computed(() => {
  return spaces.value.filter(d => followingSpaceIds.value.includes(d.id));
});

onMounted(async () => {
  isLoading.value = true;
  await loadSpacesFollowed();
  await loadOwnedEnsDomains(props.userAddress);
  await loadSpaces([
    ...ownedEnsDomains.value.map(d => d.name),
    ...followingSpaceIds.value
  ]);
  await loadNFTClaimer();
  isLoading.value = false;
});
</script>

<template>
  <div>
    <div class="space-y-4">
      <ProfileAboutBiography v-if="profile?.about" :about="profile.about" />
      <BlockSpacesList
        :spaces="domainsWithExistingSpace"
        :title="$t('profile.about.createdSpaces')"
        :message="$t('profile.about.notCreatedSpacesYet')"
        :loading="isLoading"
      />

      <BlockSpacesList
        :spaces="followingSpaces"
        :title="$t('profile.about.joinedSpaces')"
        :message="$t('profile.about.notJoinSpacesYet')"
        :loading="isLoading"
      />

      <ProfileAboutNFT :loading="isLoading" :nfts="nfts" />

      <ProfileAboutDelegate
        :user-address="userAddress"
        :following-spaces="followingSpaces"
        :loading="isLoading"
      />
    </div>
  </div>
</template>
