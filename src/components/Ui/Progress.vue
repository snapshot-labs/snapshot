<script setup>
import { computed } from 'vue';

const props = defineProps({ value: { Number, Array }, max: Number });

const bars = computed(() =>
  Array.isArray(props.value) ? props.value : [props.value]
);
</script>

<template>
  <div class="h-2 relative overflow-hidden rounded-full flex">
    <div
      class="w-full h-full bg-[color:var(--border-color)] absolute z-5"
    ></div>
    <!-- TODO: Reword progress bar, for now opcity is just alternating -->
    <div
      v-for="(bar, i) in bars"
      :key="i"
      :style="`width: ${parseFloat((100 / max) * bar).toFixed(3)}%;`"
      class="bg-blue h-full z-10"
      :class="{ 'opacity-50': i % 2 == 1 }"
    />
  </div>
</template>
