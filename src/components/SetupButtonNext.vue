<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string;
  }>(),
  {
    text: 'next'
  }
);
</script>

<template>
  <BaseButton :primary="text === 'next'" class="float-right mt-4">
    {{ $t(text) }}
  </BaseButton>
</template>
