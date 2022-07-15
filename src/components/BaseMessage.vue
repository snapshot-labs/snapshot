<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning';
}>();
</script>

<template>
  <div>
    <i-ho-information-circle
      v-if="level === 'info'"
      class="float-left mr-1 text-sm"
    />
    <i-ho-exclamation-circle v-else class="float-left mr-1 text-sm" />
    <div class="leading-5">
      <slot />
    </div>
  </div>
</template>
