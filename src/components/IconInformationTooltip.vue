<script setup lang="ts">
defineProps<{
  information?: string;
}>();
</script>

<template>
  <span
    v-if="!!information"
    v-tippy="{ content: information }"
    class="text-xs hover:text-skin-link"
  >
    <i-ho-question-mark-circle />
  </span>
</template>
