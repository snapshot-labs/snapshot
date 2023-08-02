<script setup lang="ts">
export interface Props {
  isActive?: boolean;
}

withDefaults(defineProps<Props>(), {
  isActive: false
});
</script>

<template>
  <div
    :class="[
      'group relative block cursor-pointer whitespace-nowrap px-4 py-2 text-skin-link hover:bg-skin-bg',
      {
        'max-lg:nav-bottom-border': isActive
      }
    ]"
  >
    <slot />
    <div v-if="isActive" class="lg:nav-left-border" />
  </div>
</template>

<style scoped>
@tailwind components;

@layer components {
  .nav-left-border {
    @apply absolute left-0 top-[4px] h-[32px] w-[4px] rounded-br rounded-tr bg-skin-text transition-all duration-300;
  }

  .nav-bottom-border {
    @apply border-b-[3px] border-skin-border;
  }
}
</style>
