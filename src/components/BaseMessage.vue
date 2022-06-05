<script setup lang="ts">
defineProps<{
  level: 'info' | 'warning';
}>();
</script>

<template>
  <BaseBlock
    :class="[
      'text-skin-text border rounded-xl',
      { '!border-skin-text ': level === 'warning' }
    ]"
  >
    <BaseIcon
      :name="level"
      :size="level === 'info' ? '20' : '16'"
      class="mr-1 float-left"
      :class="{ 'text-skin-link ': level === 'warning' }"
    />
    <div :class="[' leading-5', { '-mt-[2px]': level === 'warning' }]">
      <slot />
    </div>
  </BaseBlock>
</template>
