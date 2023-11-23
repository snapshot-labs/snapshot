<script setup lang="ts">
const input = ref('1');
</script>

<template>
  <Story>
    <TuneRadio
      v-model="input"
      value="1"
      label="Switch me"
      hint="I'm radio 1"
      class="m-1"
    />
    <TuneRadio
      v-model="input"
      value="2"
      label="Switch me"
      hint="I'm radio 2"
      class="m-1"
    />
  </Story>
</template>
