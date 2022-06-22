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
    <BaseIcon
      :name="level"
      :size="level === 'info' ? '20' : '16'"
      class="float-left mr-1"
      :class="{ 'text-skin-link ': level === 'warning' }"
    />
    <div :class="[' leading-5', { '-mt-[2px]': level === 'warning' }]">
      <slot />
    </div>
  </BaseBlock>
</template>
