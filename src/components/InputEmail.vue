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
    placeholder="you@example.com"
    class="!pl-[44px]"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #before>
      <i-ho-mail class="-mb-[1px] text-base text-skin-text" />
    </template>
  </BaseInput>
</template>
