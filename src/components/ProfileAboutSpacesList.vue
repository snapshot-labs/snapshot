<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSpaces } from '@/composables/useSpaces';
import { FOLLOWS_QUERY } from '@/helpers/queries';
import { useApolloQuery } from '@/composables/useApolloQuery';

const props = defineProps<{
  userAddress: string;
}>();

const { spaces } = useSpaces();
const { apolloQuery } = useApolloQuery();

const loadingSpaces = ref(true);
const followingSpaces = ref([]);

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
    <h3>
      {{ $t('profile.about.joinedSpaces') }}
    </h3>
    <ProfileAboutSpacesListSkeleton
      v-if="loadingSpaces || !Object.keys(spaces).length"
    />
    <div v-else class="flex overflow-x-auto no-scrollbar space-x-2">
      <div
        class="text-center max-w-[52px] min-w-[52px]"
        v-for="space in followingSpaces.map((f: any) => f.space.id)"
        :key="space"
      >
        <ProfileAboutSpacesListItem
          v-if="spaces?.[space]"
          :space="spaces[space]"
        />
      </div>
    </div>
  </div>
</template>
