<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning';
  isResponsive?: boolean;
}>();
</script>

<template>
  <BaseBlock
    :class="[
      'rounded-xl border text-skin-text',
      { '!border-skin-text ': level === 'warning' },
      {
        ' rounded-none border-x-0': isResponsive
      }
    ]"
  >
    <BaseMessage :level="level">
      <slot />
    </BaseMessage>
  </BaseBlock>
</template>
