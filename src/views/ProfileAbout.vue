<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';

const props = defineProps<{
  userAddress: string;
  profile?: { about?: string };
}>();

const { apolloQuery } = useApolloQuery();

const followingSpaces = ref([]);
const loadingFollowedSpaces = ref(true);

async function loadSpaces() {
  loadingFollowedSpaces.value = true;
  try {
    Promise.all([
      (followingSpaces.value = await apolloQuery(
        {
          query: FOLLOWS_QUERY,
          variables: {
            follower_in: props.userAddress
          }
        },
        'follows'
      ))
    ]);
    loadingFollowedSpaces.value = false;
  } catch (e) {
    loadingFollowedSpaces.value = false;
    console.error(e);
  }
}
onMounted(() => loadSpaces());
</script>

<template>
  <div>
    <div class="space-y-4">
      <ProfileAboutBiography v-if="profile?.about" :about="profile.about" />
      <ProfileAboutSpacesList
        :userAddress="userAddress"
        :followingSpaces="followingSpaces"
        :loadingFollowedSpaces="loadingFollowedSpaces"
      />
      <ProfileAboutDelegate
        :userAddress="userAddress"
        :followingSpaces="followingSpaces"
        :loadingFollowedSpaces="loadingFollowedSpaces"
      />
    </div>
  </div>
</template>
