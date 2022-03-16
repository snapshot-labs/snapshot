<script setup lang="ts">
defineProps<{
  slim?: boolean;
}>();
</script>

<template>
  <div :class="slim ? 'px-0 md:px-4' : 'px-4'" class="max-w-[1012px] mx-auto">
    <slot />
  </div>
</template>
