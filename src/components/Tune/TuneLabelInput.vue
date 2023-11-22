<script setup lang="ts">
defineProps<{
  hint?: string;
  sublabel?: string;
}>();
</script>

<template>
  <div class="tune-label-container flex flex-col">
    <div class="tune-label flex items-center gap-1">
      <slot />
      <TuneIconHint :hint="hint" />
    </div>
    <div v-if="sublabel" class="tune-sublabel">
      {{ sublabel }}
    </div>
  </div>
</template>
