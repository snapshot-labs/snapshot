<script setup>
import { computed, onMounted } from 'vue';
import { useApp } from '@/composables/useApp';
import { useRoute } from 'vue-router';
import { useDomain } from '@/composables/useDomain';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import { useRouter } from 'vue-router';
import { formatSpace } from '@/helpers/utils';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';

const route = useRoute();
const router = useRouter();
const { domain } = useDomain();
const { explore } = useApp();
const aliasedSpace = aliases[domain] || aliases[route.params.key];
const { loadExtentedSpaces, extentedSpaces, spaceLoading } =
  useExtendedSpaces();

// Redirect the user to the ENS address if the space is aliased.
if (aliasedSpace) {
  const updatedPath = route.path.replace(
    domain || route.params.key,
    aliasedSpace
  );
  router.replace({ path: updatedPath });
}

const spaceId = computed(() => aliasedSpace || domain || route.params.key);
const space = computed(
  () =>
    formatSpace(extentedSpaces.value?.find(s => s.id === spaceId.value)) ??
    explore.value.spaces[spaceId.value]
);

const from = computed(() => route.params.from);
const spaceFrom = computed(() =>
  formatSpace(extentedSpaces.value?.find(s => s.id === from.value))
);

onMounted(() => loadExtentedSpaces([spaceId.value, from.value]));
</script>

<template>
  <router-view
    :spaceId="spaceId"
    :space="space"
    :from="from"
    :spaceFrom="spaceFrom"
    :spaceLoading="spaceLoading"
    :loadExtentedSpaces="loadExtentedSpaces"
  />
</template>
