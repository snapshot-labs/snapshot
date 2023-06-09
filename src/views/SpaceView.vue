<script setup lang="ts">
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import { useFlaggedMessageStatus } from '@/composables/useFlaggedMessageStatus';

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
const space = computed(() =>
  extendedSpaces.value?.find(s => s.id === spaceKey.value.toLowerCase())
);

const { isMessageVisible, setMessageVisibility } =
  useFlaggedMessageStatus(spaceKey);

watch(
  spaceKey,
  async () => {
    if (!spaceKey.value) return;
    await loadExtendedSpace(spaceKey.value.toLowerCase());
    if (!space.value) {
      router.push('/');
    }
    setMessageVisibility(space.value?.flagged || false);
  },
  { immediate: true }
);
</script>

<template>
  <template v-if="space">
    <BaseContainer v-if="isMessageVisible" slim>
      <MessageWarningFlagged
        type="space"
        responsive
        @forceShow="setMessageVisibility(false)"
      />
    </BaseContainer>

    <router-view v-else :space="space" :space-key="spaceKey" />
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
