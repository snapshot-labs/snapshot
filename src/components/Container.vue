<script setup>
import { defineProps } from 'vue';

defineProps({
  slim: Boolean
});
</script>

<template>
  <div :class="slim ? 'px-0 px-md-4' : 'px-4'" class="container-lg mx-auto">
    <slot />
  </div>
</template>
