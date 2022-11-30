<script setup lang="ts">
const props = defineProps<{
  text: string;
  truncate: number;
}>();
</script>

<template>
  <span v-text="props.text.slice(0, props.truncate)" />
</template>
