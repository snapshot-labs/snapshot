<script setup>
/**
 * An input with ENS TLD validation and a register button, forwarding to app.ens.domains.
 * Emits waitForRegistration event when Register button is clicked, to trigger domain lookup in background.
 */

import { computed } from 'vue';
import { useEns } from '@/composables/useEns';

const { validEnsTlds } = useEns();

const props = defineProps({
  modelValue: String
});

defineEmits(['update:modelValue', 'waitForRegistration']);

const isValidDomain = computed(() => {
  if (!props.modelValue.includes('.')) return false;
  return validEnsTlds.includes(props.modelValue.split('.').pop());
});
</script>

<template>
  <div>
    <BaseInput
      :model-value="modelValue"
      :placeholder="$t('setup.example')"
      class="!pr-[44px]"
      @input="$emit('update:modelValue', $event.target.value.toLowerCase())"
    >
      <template #after>
        <span
          v-tippy="{
            content: `${$t('setup.supportedEnsTLDs')}: ${validEnsTlds.join(
              ', '
            )}`
          }"
          class="-mr-2 flex cursor-help items-center"
          target="_blank"
        >
          <BaseIcon name="info" size="24" class="-mr-1 text-skin-text" />
        </span>
      </template>
    </BaseInput>
    <BaseLink
      :link="`https://app.ens.domains/name/${modelValue}/register`"
      hide-external-icon
      @click="$emit('waitForRegistration')"
    >
      <BaseButton :disabled="!isValidDomain" class="mt-2 w-full" primary>
        {{ $t('setup.registerEnsButton') }}
      </BaseButton>
    </BaseLink>
  </div>
</template>
