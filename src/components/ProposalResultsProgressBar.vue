<script setup>
import { computed } from 'vue';

const props = defineProps({ value: { Number, Array }, max: Number });

const bars = computed(() =>
  Array.isArray(props.value) ? props.value : [props.value]
);
</script>

<template>
  <div class="relative flex h-2 overflow-hidden rounded-full">
    <div class="z-5 absolute h-full w-full bg-[color:var(--border-color)]" />
    <div
      v-for="(bar, i) in bars.filter(b => b !== 0)"
      :key="i"
      :style="`width: ${parseFloat((100 / max) * bar).toFixed(3)}%;`"
      class="z-10 h-full bg-primary"
      :class="{
        'opacity-80': i === 1,
        'opacity-60': i === 2,
        'opacity-40': i === 3,
        'opacity-20': i >= 4
      }"
    />
  </div>
</template>
