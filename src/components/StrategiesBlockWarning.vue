<script setup lang="ts">
defineProps<{
  error?: string;
}>();
</script>

<template>
  <BaseBlock v-if="error" class="mt-3 !border-red">
    <BaseIcon name="warning" class="mr-2 !text-red" />
    <span class="!text-red" v-html="error" />
  </BaseBlock>
</template>
