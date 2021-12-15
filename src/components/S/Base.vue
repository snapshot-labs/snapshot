<script setup>
defineProps({ definition: Object });
</script>

<template>
  <label v-if="definition.title" v-text="definition.title" class="s-label" />
  <slot />
  <legend v-if="definition.description" v-text="definition.description" />
</template>
