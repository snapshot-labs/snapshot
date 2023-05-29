<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning' | 'warning-red' | 'success';
}>();
</script>

<template>
  <div>
    <i-ho-information-circle
      v-if="level === 'info'"
      class="float-left mr-1 text-sm"
    />
    <i-ho-exclamation-circle
      v-else-if="level === 'warning'"
      class="float-left mr-1 text-sm"
      :class="{ 'text-red': level === 'warning-red' }"
    />
    <i-ho-check-circle
      v-else-if="level === 'success'"
      class="float-left mr-1 text-sm text-green"
    />
    <div class="leading-5" :class="{ 'text-red': level === 'warning-red' }">
      <slot />
    </div>
  </div>
</template>
