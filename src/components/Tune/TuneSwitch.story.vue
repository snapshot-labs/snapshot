<script setup lang="ts">
const input = ref(false);
</script>

<template>
  <Story>
    <TuneSwitch
      v-model="input"
      label="Switch me"
      hint="I'm a switch"
      sublabel="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod."
    />
  </Story>
</template>
