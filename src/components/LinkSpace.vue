<script setup lang="ts">
import domains from '@/../snapshot-spaces/spaces/domains.json';

const props = defineProps<{
  spaceId: string;
}>();

const { domain } = useApp();

const spaceLink = computed(() => {
  // Check if proposal space id is a value in the domains.json file
  if (domain && Object.values(domains).includes(props.spaceId)) {
    // If so, find the key that matches the value
    const key = Object.keys(domains).find(
      key => domains[key] === props.spaceId
    );
    return `https://${key}`;
  }

  if (domain) return `https://snapshot.org/#/${props.spaceId}`;

  return {
    name: 'spaceProposals',
    params: { key: props.spaceId }
  };
});
</script>

<template>
  <BaseLink :link="spaceLink" hide-external-icon>
    <slot />
  </BaseLink>
</template>
