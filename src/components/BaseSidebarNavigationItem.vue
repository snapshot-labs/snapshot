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
      'block px-4 py-2 hover:bg-skin-bg',
      { 'border-l-[3px] !pl-[21px]': isActive }
    ]"
  >
    <slot />
  </div>
</template>
