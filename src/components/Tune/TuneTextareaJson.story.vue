<script setup lang="ts">
const input = ref({ test: 1 });
</script>

<template>
  <Story>
    <TuneTextareaJson
      v-model="input"
      label="About you"
      placeholder="Tell us about yourself"
    />
  </Story>
</template>
