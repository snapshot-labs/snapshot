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
  <div
    v-if="isCore"
    class="ml-1 border px-[7px] text-xs rounded-full text-skin-text"
  >
    {{ $t('isCore') }}
  </div>
</template>
