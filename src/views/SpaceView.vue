<script setup lang="ts">
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import { useFlaggedMessageStatus } from '@/composables/useFlaggedMessageStatus';

const route = useRoute();
const router = useRouter();
const { domain } = useApp();
const { loadExtendedSpace, extendedSpaces } = useExtendedSpaces();

const aliasedSpace = computed(
  () => aliases[domain] || aliases[route.params.key as string]
);

const spaceKey = computed(
  () => aliasedSpace.value || domain || route.params.key
);

const space = computed(() =>
  extendedSpaces.value?.find(s => s.id === spaceKey.value.toLowerCase())
);

const { isMessageVisible, setMessageVisibility } =
  useFlaggedMessageStatus(spaceKey);

watch(
  spaceKey,
  async () => {
    if (!spaceKey.value || aliasedSpace.value) return;
    await loadExtendedSpace(spaceKey.value.toLowerCase());
    if (!space.value) {
      router.push('/');
    }
    setMessageVisibility(space.value?.flagged || false);
  },
  { immediate: true }
);

onMounted(() => {
  if (aliasedSpace.value) {
    const updatedPath = route.path.replace(
      domain || route.params.key,
      aliasedSpace.value
    );
    router.replace({ path: updatedPath });
  }
});
</script>

<template>
  <template v-if="space">
    <BaseContainer v-if="isMessageVisible" slim>
      <MessageWarningFlagged
        type="space"
        responsive
        @force-show="setMessageVisibility(false)"
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
        $route.name === 'spaceTreasury' ||
        $route.name === 'spaceDelegates'
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
