<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning' | 'warning-red';
  isResponsive?: boolean;
}>();
</script>

<template>
  <BaseBlock
    :class="[
      'rounded-xl border text-skin-text',
      { '!border-skin-text': level === 'warning' },
      { '!border-red': level === 'warning-red' },
      {
        '!rounded-none border-x-0 md:!rounded-xl': isResponsive
      }
    ]"
  >
    <BaseMessage :level="level">
      <slot />
    </BaseMessage>
  </BaseBlock>
</template>
