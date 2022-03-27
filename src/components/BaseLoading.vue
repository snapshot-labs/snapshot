<script setup lang="ts">
defineProps<{ block?: boolean }>();
</script>

<template>
  <BaseBlock v-if="block" slim>
    <slot />
  </BaseBlock>
  <div v-else>
    <slot />
  </div>
</template>
