<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({ address: String, members: Object });

const isCore = computed(() => {
  if (!props.members) return false;
  const members = props.members.map(address => address.toLowerCase());
  return members.includes(props.address.toLowerCase());
});
</script>

<template>
  <UiLabel v-if="isCore" class="ml-1">
    {{ $t('isCore') }}
  </UiLabel>
</template>
