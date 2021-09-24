<script setup>
import { computed, onMounted, ref } from 'vue';
import { useApp } from '@/composables/useApp';
import { useRoute } from 'vue-router';
import { useDomain } from '@/composables/useDomain';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import { useRouter } from 'vue-router';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { SPACES_QUERY } from '@/helpers/queries';
import { formatSpace } from '@/helpers/utils';

const route = useRoute();
const router = useRouter();
const { domain } = useDomain();
const { explore } = useApp();
const { apolloQuery } = useApolloQuery();
const aliasedSpace = aliases[domain] || aliases[route.params.key];

const extentedSpaces = ref([]);
const spaceLoading = ref(true);

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

async function getExtentedSpaces(id_in = []) {
  spaceLoading.value = true;
  try {
    const response = await apolloQuery(
      {
        query: SPACES_QUERY,
        variables: {
          id_in
        }
      },
      'spaces'
    );
    extentedSpaces.value = response;
    spaceLoading.value = false;
  } catch (e) {
    console.error(e);
    spaceLoading.value = false;
  }
}

onMounted(() => getExtentedSpaces([spaceId.value, from.value]));
</script>

<template>
  <router-view
    :spaceId="spaceId"
    :space="space"
    :from="from"
    :spaceFrom="spaceFrom"
    :spaceLoading="spaceLoading"
    :getExtentedSpaces="getExtentedSpaces"
  />
</template>
