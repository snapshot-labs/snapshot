<script setup lang="ts">
defineProps<{
  modelValue: string;
  title: string;
}>();

const emit = defineEmits(['select']);
</script>

<template>
  <div class="w-full">
    <LabelInput>{{ title }}</LabelInput>
    <BaseButton
      :class="$attrs.class"
      class="relative !h-[42px] w-full truncate pl-3 pr-5 text-left"
      @click="emit('select')"
    >
      {{ modelValue }}
      <i-ho-chevron-down
        class="absolute inset-y-[12px] right-[14px] text-xs text-skin-text"
      />
    </BaseButton>
  </div>
</template>
