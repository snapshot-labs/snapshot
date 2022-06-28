<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning';
}>();
</script>

<template>
  <BaseBlock
    :class="[
      'rounded-xl border text-skin-text',
      { '!border-skin-text ': level === 'warning' }
    ]"
  >
    <BaseMessage :level="level">
      <slot />
    </BaseMessage>
  </BaseBlock>
</template>
