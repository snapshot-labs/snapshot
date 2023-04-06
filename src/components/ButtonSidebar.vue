<script setup lang="ts">
defineProps<{
  isDisabled?: boolean;
  as?: string;
}>();
</script>

<template>
  <component
    :is="as || 'button'"
    :disabled="as === 'button' ? isDisabled : null"
    :class="{ '!cursor-not-allowed': isDisabled }"
    class="flex h-[44px] w-[44px] cursor-pointer select-none items-center justify-center rounded-full border hover:border-skin-text"
  >
    <slot />
  </component>
</template>
