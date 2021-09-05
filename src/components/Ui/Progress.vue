<script setup>
import { computed } from 'vue';

const props = defineProps({ value: { Number, Array }, max: Number });

const bars = computed(() =>
  Array.isArray(props.value) ? props.value : [props.value]
);
</script>

<template>
  <div class="h-2 relative overflow-hidden rounded-full flex opacity-90">
    <div
      class="w-full h-full bg-[color:var(--border-color)] absolute z-5"
    ></div>
    <div
      v-for="(bar, i) in bars"
      :key="i"
      :style="`width: ${parseFloat((100 / max) * bar).toFixed(3)}%;`"
      class="bg-blue h-full z-10"
      :class="{ 'opacity-60': i !== 1 && i % 2 !== 0 }"
    />
  </div>
</template>
