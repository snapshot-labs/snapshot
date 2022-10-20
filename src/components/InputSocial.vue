<script setup lang="ts">
defineProps<{
  modelValue?: string;
  error?: { message: string; push: boolean };
  placeholder?: string;
  maxLength?: number;
  title?: string;
  icon?: 'twitter' | 'github' | 'earth' | 'coingecko';
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <BaseInput
    :title="title"
    :model-value="modelValue"
    :error="error"
    :placeholder="placeholder"
    :max-length="maxLength"
    class="!pl-[40px]"
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <template #before>
      <i-s-twitter v-if="icon === 'twitter'" class="text-[16px]" />
      <i-s-github v-if="icon === 'github'" class="text-[16px]" />
      <i-ho-globe-alt v-if="icon === 'earth'" class="text-[16px]" />
      <i-s-coingecko v-if="icon === 'coingecko'" class="text-[16px]" />
    </template>
  </BaseInput>
</template>
