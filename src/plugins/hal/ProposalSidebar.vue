<script setup>
defineProps({
  space: Object
});
</script>

<template>
  <PluginHalCustomBlock v-if="space.plugins.hal" :space="space" />
</template>
