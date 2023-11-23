<script setup lang="ts">
const items = [
  { name: 'One', id: '1' },
  { name: 'Two', id: '2' },
  { name: 'Three', id: '3' },
  { name: 'Four', id: '4' },
  { name: 'Five', id: '5' },
  { name: 'Six', id: '6' }
];

const input = ref('1');
</script>

<template>
  <Story>
    <TuneCombobox v-model="input" :items="items" />
  </Story>
</template>
