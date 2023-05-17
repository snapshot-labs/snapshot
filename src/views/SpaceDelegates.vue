<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { useInfiniteScroll } from '@vueuse/core';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const {
  fetchDelegates,
  fetchMoreDelegates,
  delegates,
  isLoadingDelegates,
  hasMoreDelegates
} = useDelegates();
const { profiles, loadProfiles } = useProfiles();

useInfiniteScroll(
  document,
  () => {
    fetchMoreDelegates();
  },
  { distance: 250, interval: 500 }
);

watch(delegates, () => {
  loadProfiles(delegates.value.map(delegate => delegate.id));
});

onMounted(() => {
  if (!delegates.value.length) fetchDelegates();
});
</script>

<template>
  <BaseContainer>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      <SpaceDelegatesSkeleton v-if="isLoadingDelegates" />
      <template v-else>
        <div v-for="(delegate, i) in delegates" :key="i">
          <SpaceDelegatesListItem
            :delegate="delegate"
            :profiles="profiles"
            :space="space"
          />
        </div>
      </template>
    </div>
    <div v-if="hasMoreDelegates" class="mt-4 flex">
      <LoadingSpinner class="mx-auto" big />
    </div>
  </BaseContainer>
</template>
