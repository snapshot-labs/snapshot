<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { useApolloQuery, useEns, useExtendedSpaces } from '@/composables';

const props = defineProps<{
  userAddress: string;
  profile?: { about?: string };
}>();

const { apolloQuery } = useApolloQuery();

const followedSpaces = ref([]);
const loadingFollowedSpaces = ref(true);

async function loadSpacesFollowed() {
  loadingFollowedSpaces.value = true;
  try {
    followedSpaces.value = await apolloQuery(
      {
        query: FOLLOWS_QUERY,
        variables: {
          follower_in: props.userAddress
        }
      },
      'follows'
    );
    loadingFollowedSpaces.value = false;
  } catch (e) {
    loadingFollowedSpaces.value = false;
    console.error(e);
  }
}
onMounted(() => loadSpacesFollowed());

const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { loadExtendedSpaces, extendedSpaces } = useExtendedSpaces();

const domainsWithExistingSpace = computed(() => {
  const spaces = ownedEnsDomains.value.map(d => d.name);
  return extendedSpaces.value.filter(d => spaces.includes(d.id));
});

const loadingOwnedSpaces = ref(false);

onMounted(async () => {
  loadingOwnedSpaces.value = true;
  await loadOwnedEnsDomains(props.userAddress);
  await loadExtendedSpaces(ownedEnsDomains.value.map(d => d.name));
  loadingOwnedSpaces.value = false;
});
</script>

<template>
  <div>
    <div class="space-y-4">
      <ProfileAboutBiography v-if="profile?.about" :about="profile.about" />
      <BlockSpacesList
        :spaces="domainsWithExistingSpace.map(f => f.id)"
        :title="$t('profile.about.createdSpaces')"
        :message="$t('profile.about.notCreatedSpacesYet')"
        :loading="loadingOwnedSpaces"
      />

      <BlockSpacesList
        :spaces="followedSpaces.map(f => f.space.id)"
        :title="$t('profile.about.joinedSpaces')"
        :message="$t('profile.about.notJoinSpacesYet')"
        :loading="loadingFollowedSpaces"
      />

      <ProfileAboutDelegate
        :user-address="userAddress"
        :following-spaces="followedSpaces"
        :loading-followed-spaces="loadingFollowedSpaces"
      />
    </div>
  </div>
</template>
