<script setup lang="ts">
const input = ref('');
</script>

<template>
  <Story>
    <TuneTextarea
      v-model="input"
      label="About you"
      placeholder="Tell us about yourself"
    />
  </Story>
</template>
