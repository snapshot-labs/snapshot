<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ address: string; members?: string[] }>();

const isCore = computed(() => {
  if (!props.members) return false;
  const members = props.members.map(address => address.toLowerCase());
  return members.includes(props.address.toLowerCase());
});
</script>

<template>
  <BaseLabel v-if="isCore" class="ml-1">
    {{ $t('isCore') }}
  </BaseLabel>
</template>
