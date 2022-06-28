<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';

const props = defineProps<{
  userAddress: string;
  profile?: { about?: string };
}>();

const { apolloQuery } = useApolloQuery();

const followedSpaces = ref([]);
const loadingFollowedSpaces = ref(true);

async function loadSpaces() {
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
onMounted(() => loadSpaces());
</script>

<template>
  <div>
    <div class="space-y-4">
      <ProfileAboutBiography v-if="profile?.about" :about="profile.about" />
      <ProfileAboutSpacesList
        :user-address="userAddress"
        :following-spaces="followedSpaces"
        :loading-followed-spaces="loadingFollowedSpaces"
      />
      <ProfileAboutDelegate
        :user-address="userAddress"
        :following-spaces="followedSpaces"
        :loading-followed-spaces="loadingFollowedSpaces"
      />
    </div>
  </div>
</template>
