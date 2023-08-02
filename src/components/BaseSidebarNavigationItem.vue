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
      'group relative block cursor-pointer whitespace-nowrap px-4 py-2 text-skin-text hover:bg-skin-bg',
      { '!text-skin-heading': isActive }
    ]"
  >
    <slot />
    <div class="absolute left-0 top-0 flex h-full w-full justify-center">
      <div
        v-if="isActive"
        class="lg:nav-left-border max-lg:nav-bottom-border"
      />
    </div>
  </div>
</template>

<style scoped>
@tailwind components;

@layer components {
  .nav-left-border {
    @apply absolute left-0 top-[4px] h-[32px] w-[4px] rounded-br rounded-tr bg-skin-text;
  }

  .nav-bottom-border {
    @apply absolute bottom-[0px] h-[4px] w-4/6 rounded-tl rounded-tr bg-skin-text;
  }
}
</style>
