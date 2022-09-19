<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  name: string;
  label: string;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex items-center gap-[12px]">
    <input
      :checked="modelValue"
      :name="name"
      type="radio"
      class="form-radio h-[19px] w-[19px] rounded-full border-skin-text bg-skin-bg text-primary !outline-none !ring-0"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
    />
    <div class="text-skin-text">
      {{ label }}
    </div>
  </div>
</template>
