<script setup lang="ts">
// import { FOLLOWS_QUERY } from '@/helpers/queries';

const props = defineProps<{
  userAddress: string;
  profile?: { about?: string };
}>();

// const { apolloQuery } = useApolloQuery();

const loadingOwnedCollectibles = ref(false);
const collectibles = ref([]);

async function loadCollectibles() {
  collectibles.value = [];
}

onMounted(async () => {
  loadingOwnedCollectibles.value = true;
  await loadCollectibles();
  loadingOwnedCollectibles.value = false;
});
</script>

<template>
  <div>
    <div class="space-y-4">
      <span>Collectibles not found.</span>
    </div>
  </div>
</template>
