<script setup lang="ts">
const input = ref([]);
</script>

<template>
  <Story>
    <TuneTextareaArray
      v-model="input"
      label="Addresses"
      :placeholder="`0xBdCA4F610e7101Cc172E2135ba025737B99AbD30\n0xbc61f6973cE564eFFB16Cd79B5BC3916eaD592E2`"
    />
  </Story>
</template>
