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
    <div
      v-for="(bar, i) in bars.filter(b => b !== 0)"
      :key="i"
      :style="`width: ${parseFloat((100 / max) * bar).toFixed(3)}%;`"
      class="bg-primary h-full z-10"
      :class="{
        'opacity-80': i === 1,
        'opacity-60': i === 2,
        'opacity-40': i === 3,
        'opacity-20': i >= 4
      }"
    />
  </div>
</template>
