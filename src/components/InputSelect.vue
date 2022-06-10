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
      class="!h-[42px] w-full pl-3 text-left"
      @click="emit('select')"
    >
      {{ modelValue }}
    </BaseButton>
  </div>
</template>
