<script setup lang="ts">
defineProps<{
  isActive: boolean;
}>();
</script>

<template>
  <div
    :class="[
      'block whitespace-nowrap px-4 py-2  hover:bg-skin-bg',
      {
        'border-l-[0px] border-b-[3px] !pl-[21px] lg:border-b-[0px] lg:border-l-[3px]':
          isActive
      }
    ]"
  >
    <slot />
  </div>
</template>
