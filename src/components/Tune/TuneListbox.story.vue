<script setup lang="ts">
const items = [
  { name: 'One', value: 1 },
  { name: 'Two', value: 2 },
  { name: 'Three', value: 3 }
];

const input = ref(1);
</script>

<template>
  <Story>
    <TuneListbox v-model="input" :items="items" />
  </Story>
</template>
