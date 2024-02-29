<script setup lang="ts">
import { Switch } from '@headlessui/vue';

type Definition = {
  title: string;
  description: string;
  sublabel: string;
};

defineProps<{
  modelValue: boolean;
  label?: string;
  sublabel?: string;
  hint?: string;
  definition?: Partial<Definition>;
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div
    class="flex space-x-2 pr-2 pt-1"
    :class="sublabel || definition?.sublabel ? 'items-start' : 'items-center'"
  >
    <Switch
      :model-value="modelValue"
      :class="[
        'tune-switch relative inline-flex h-[22px] w-[38px] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out',
        modelValue ? 'switched-on-bg' : 'switched-off-bg',
        { '!cursor-not-allowed ': disabled }
      ]"
      :disabled="disabled"
      @update:model-value="value => emit('update:modelValue', value)"
    >
      <span v-if="label || definition?.title" class="sr-only">
        {{ label || definition?.title }}
      </span>
      <span
        :class="[
          modelValue ? 'translate-x-[16px]' : 'translate-x-0',
          'shadow tune-switch-button pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full transition duration-200 ease-in-out'
        ]"
      >
        <span
          :class="[
            modelValue
              ? 'opacity-0 duration-100 ease-out'
              : 'opacity-100 duration-200 ease-in',
            'tune-switch switched-off-text absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
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
            'tune-switch switched-on-text absolute inset-0 flex h-full w-full items-center justify-center transition-opacity'
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
    <TuneLabelInput
      v-if="label || definition?.title"
      :hint="hint || definition?.description"
      :sublabel="sublabel || definition?.sublabel"
    >
      <div class="text-skin-heading">
        {{ label || definition?.title }}
      </div>
    </TuneLabelInput>
  </div>
</template>
