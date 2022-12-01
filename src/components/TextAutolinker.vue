<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
  truncate?: number;
}>();

const spanText = computed(() =>
  props.truncate ? props.text.slice(0, props.truncate) : props.text
);
</script>

<template>
  <span v-text="spanText" />
</template>
