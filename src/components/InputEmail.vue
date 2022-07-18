<script setup lang="ts">
defineProps<{
  modelValue?: string;
  focusOnMount?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <BaseInput
    v-bind="$attrs"
    :model-value="modelValue"
    :focus-on-mount="focusOnMount"
    type="email"
    :placeholder="$t('newsletter.yourEmail')"
    class="!pr-[66px]"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #after>
      <slot />
    </template>
  </BaseInput>
</template>
