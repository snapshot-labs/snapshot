<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning';
}>();
</script>

<template>
  <Block :class="level === 'warning' && '!border-skin-link text-skin-link'">
    <Icon :name="level" class="mr-1" />
    <slot />
  </Block>
</template>
