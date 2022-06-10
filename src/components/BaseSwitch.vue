<script setup lang="ts">
import { Switch } from '@headlessui/vue';

defineProps<{
  modelValue: boolean;
  label?: string;
  textRight?: string;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex items-center space-x-2 pr-2">
    <Switch
      :model-value="modelValue"
      :class="modelValue ? 'bg-green' : 'bg-skin-border'"
      class="relative inline-flex h-[22px] w-[38px] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent outline-offset-2 transition-colors duration-200 ease-in-out"
      @update:model-value="value => emit('update:modelValue', value)"
    >
      <span v-if="label" class="sr-only">{{ label }}</span>
      <span
        :class="[
          modelValue ? 'translate-x-[16px]' : 'translate-x-0',
          'shadow pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-skin-bg transition duration-200 ease-in-out'
        ]"
      >
        <span
          :class="[
            modelValue
              ? 'opacity-0 duration-100 ease-out'
              : 'opacity-100 duration-200 ease-in',
            'absolute inset-0 flex h-full w-full items-center justify-center text-skin-text transition-opacity'
          ]"
          aria-hidden="true"
        >
          <svg class="h-[10px] w-[10px]" fill="none" viewBox="0 0 12 12">
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span
          :class="[
            modelValue
              ? 'opacity-100 duration-200 ease-in'
              : 'opacity-0 duration-100 ease-out',
            'absolute inset-0 flex h-full w-full items-center justify-center text-green transition-opacity'
          ]"
          aria-hidden="true"
        >
          <svg
            class="h-[10px] w-[10px]"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path
              d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
            />
          </svg>
        </span>
      </span>
    </Switch>
    <span v-if="textRight">{{ textRight }}</span>
  </div>
</template>
