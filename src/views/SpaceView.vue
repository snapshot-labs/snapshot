<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';

import { useApp, useExtendedSpaces } from '@/composables';

const route = useRoute();
const router = useRouter();
const { domain } = useApp();
const aliasedSpace = aliases[domain] || aliases[route.params.key as string];
const { loadExtendedSpaces, extendedSpaces } = useExtendedSpaces();

// Redirect the user to the ENS address if the space is aliased.
if (aliasedSpace) {
  const updatedPath = route.path.replace(
    domain || route.params.key,
    aliasedSpace
  );
  router.replace({ path: updatedPath });
}

const spaceKey = computed(() => aliasedSpace || domain || route.params.key);
const space = computed(() =>
  extendedSpaces.value?.find(s => s.id === spaceKey.value.toLowerCase())
);

watch(
  spaceKey,
  async () => {
    if (!spaceKey.value) return;
    await loadExtendedSpaces([spaceKey.value.toLowerCase()]);
    if (!space.value) {
      router.push('/');
    }
  },
  { immediate: true }
);
</script>

<template>
  <SpaceWarningFlagged :space-key="spaceKey" />

  <router-view v-if="space" :space="space" :space-key="spaceKey" />
  <div v-else>
    <!-- Lazy loading skeleton for space page with left sidebar layout -->
    <TheLayout
      v-if="
        $route.name === 'spaceProposals' ||
        $route.name === 'spaceAbout' ||
        $route.name === 'spaceTreasury'
      "
    >
      <template #sidebar-left>
        <SpaceSidebarSkeleton />
      </template>
      <template #content-right>
        <LoadingRow block />
      </template>
    </TheLayout>

    <!-- Default page loading for none sidebar left layout space pages -->
    <TheLayout v-else class="!px-4">
      <template #content-left>
        <LoadingPage />
      </template>
    </TheLayout>
  </div>
</template>
