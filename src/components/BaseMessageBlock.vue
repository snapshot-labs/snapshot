<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning';
}>();
</script>

<template>
  <Block :class="{ '!border-skin-link text-skin-link': level === 'warning' }">
    <Icon
      :name="level"
      :size="level === 'info' ? 20 : null"
      class="mr-1 float-left"
    />
    <slot />
  </Block>
</template>
