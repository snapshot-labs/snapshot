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
      'block cursor-pointer whitespace-nowrap px-4  py-2 text-skin-link hover:bg-skin-bg',
      {
        'border-b-[3px] border-l-[0px] !pl-[21px] lg:border-b-[0px] lg:border-l-[3px]':
          isActive
      }
    ]"
  >
    <slot />
  </div>
</template>
