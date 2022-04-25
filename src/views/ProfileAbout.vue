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
const loadingSpaces = ref(true);

async function loadSpaces() {
  loadingSpaces.value = true;
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
    loadingSpaces.value = false;
  } catch (e) {
    loadingSpaces.value = false;
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
        :loadingSpaces="loadingSpaces"
      />
      <ProfileAboutDelegate
        :userAddress="userAddress"
        :followingSpaces="followingSpaces"
      />
    </div>
  </div>
</template>
