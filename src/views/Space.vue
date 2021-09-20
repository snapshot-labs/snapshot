<script setup>
import { computed } from 'vue';
import { useApp } from '@/composables/useApp';
import { useRoute } from 'vue-router';
import { useDomain } from '@/composables/useDomain';
import aliases from '@/../snapshot-spaces/spaces/aliases.json';
import { useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { domain } = useDomain();
const { spaces } = useApp();
const aliasedSpace = aliases[domain] || aliases[route.params.key];

// Redirect the user to the ENS address if the space is aliased.
if (aliasedSpace) {
  const updatedPath = route.path.replace(
    domain || route.params.key,
    aliasedSpace
  );
  router.replace({ path: updatedPath });
}

const spaceId = computed(() => aliasedSpace || domain || route.params.key);
const space = computed(() => spaces.value[spaceId.value]);

const from = computed(() => route.params.from);
const spaceFrom = computed(() => spaces.value[from.value]);
</script>

<template>
  <router-view
    :spaceId="spaceId"
    :space="space"
    :from="from"
    :spaceFrom="spaceFrom"
  ></router-view>
</template>
