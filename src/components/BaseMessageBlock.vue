<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning';
}>();
</script>

<template>
  <BaseBlock
    :class="[
      'text-skin-text',
      { '!border-skin-link text-skin-link': level === 'warning' }
    ]"
  >
    <BaseIcon
      :name="level"
      :size="level === 'info' ? 20 : null"
      class="mr-1 float-left"
    />
    <div :class="[' leading-5', { '-mt-[2px]': level === 'warning' }]">
      <slot />
    </div>
  </BaseBlock>
</template>
