<script setup>
import { computed, onMounted } from 'vue';
import { useDomain } from '@/composables/useDomain';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import { useRouter, useRoute } from 'vue-router';
import { formatSpace } from '@/helpers/utils';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';

const route = useRoute();
const router = useRouter();
const { domain } = useDomain();
const aliasedSpace = aliases[domain] || aliases[route.params.key];
const { loadExtentedSpaces, extentedSpaces } = useExtendedSpaces();

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
  formatSpace(extentedSpaces.value?.find(s => s.id === spaceKey.value))
);

const sourceSpaceRoute = computed(() => route.params.sourceSpace);
const sourceSpace = computed(() =>
  formatSpace(extentedSpaces.value?.find(s => s.id === sourceSpaceRoute.value))
);

onMounted(() => loadExtentedSpaces([spaceKey.value, sourceSpaceRoute.value]));
</script>

<template>
  <!-- Only loaded after space is available -->
  <router-view
    v-if="space || $route.name === 'spaceSettings'"
    :space="space"
    :sourceSpace="sourceSpace"
    :spaceKey="spaceKey"
    :loadExtentedSpaces="loadExtentedSpaces"
  />

  <div v-else>
    <!-- Lazy loading skeleton for space page with left sidebar layout -->
    <Layout
      v-if="
        !space &&
        ($route.name === 'spaceProposals' || $route.name === 'spaceAbout')
      "
    >
      <template #sidebar-left>
        <SpaceSidebarSkeleton />
      </template>
      <template #content-right>
        <RowLoadingBlock />
      </template>
    </Layout>

    <!-- Default page loading for none sidebar left layout space pages -->
    <Layout v-else-if="!space" class="!px-4">
      <template #content-left>
        <PageLoading />
      </template>
    </Layout>
  </div>
</template>
