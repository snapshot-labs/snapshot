<script setup lang="ts">
defineProps<{
  isSpaces?: boolean;
}>();
</script>

<template>
  <div
    v-if="isSpaces"
    class="grid gap-4 opacity-40 md:grid-cols-3 lg:grid-cols-4"
  >
    <div
      v-for="i in 12"
      :key="i"
      class="min-h-[266px] animate-pulse bg-skin-border md:rounded-xl"
    />
  </div>
  <div v-else class="grid gap-4 opacity-40 md:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="i in 12"
      :key="i"
      class="min-h-[124px] animate-pulse bg-skin-border md:rounded-xl"
    />
  </div>
</template>
