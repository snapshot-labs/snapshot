<script setup lang="ts">
const items = [
  { name: 'One', id: '1' },
  { name: 'Two', id: '2' },
  { name: 'ThreeThreeThreeThreeThreeThree', id: '3' },
  { name: 'FourFourFourFourFourFourFourFour', id: '4' },
  { name: 'FiveFiveFiveFiveFiveFiveFiveFive', id: '5' },
  { name: 'Six', id: '6' }
];

const input = ref(['1']);
</script>

<template>
  <Story>
    <TuneComboboxMultiple v-model="input" :items="items" />
  </Story>
</template>
