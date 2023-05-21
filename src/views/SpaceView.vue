<script setup lang="ts">
import aliases from '@/../snapshot-spaces/spaces/aliases.json';

const route = useRoute();
const router = useRouter();
const { domain } = useApp();
const aliasedSpace = aliases[domain] || aliases[route.params.key as string];
const { loadExtendedSpace, extendedSpaces } = useExtendedSpaces();

// Redirect the user to the ENS address if the space is aliased.
if (aliasedSpace) {
  const updatedPath = route.path.replace(
    domain || route.params.key,
    aliasedSpace
  );
  router.replace({ path: updatedPath });
}

const spaceKey = computed(() => aliasedSpace || domain || route.params.key);
const space = computed(() => {
  const s = extendedSpaces.value?.find(
    s => s.id === spaceKey.value.toLowerCase()
  );
  // TODO remove this mock data once added to query
  if (!s) return;
  s.delegation = {
    standard: 'compound-governor',
    contract: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    subgraphUrl:
      'https://thegraph.com/hosted-service/subgraph/arr00/uniswap-governance-v2'
  };
  return s;
});

watch(
  spaceKey,
  async () => {
    if (!spaceKey.value) return;
    await loadExtendedSpace(spaceKey.value.toLowerCase());
    if (!space.value) {
      router.push('/');
    }
  },
  { immediate: true }
);
</script>

<template>
  <template v-if="space">
    <SpaceWarningFlagged v-if="space.flagged" />

    <router-view :space="space" :space-key="spaceKey" />
  </template>
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
