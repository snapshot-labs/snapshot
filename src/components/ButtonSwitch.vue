<script setup lang="ts">
interface State {
  value: string | number | boolean;
  name: string;
}

defineProps<{
  modelValue: string | number | boolean;
  state1: State;
  state2: State;
}>();

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="inline-flex items-center rounded-full border p-1">
    <div
      :class="[
        'w-full cursor-pointer px-3 py-1 text-center',
        {
          'rounded-full bg-skin-border text-skin-heading':
            state1.value === modelValue
        }
      ]"
      @click="$emit('update:modelValue', state1.value)"
    >
      {{ state1.name }}
    </div>
    <div
      :class="[
        'w-full cursor-pointer px-3 py-1 text-center',
        {
          'rounded-full bg-skin-border text-skin-heading':
            state2.value === modelValue
        }
      ]"
      @click="$emit('update:modelValue', state2.value)"
    >
      {{ state2.name }}
    </div>
  </div>
</template>
