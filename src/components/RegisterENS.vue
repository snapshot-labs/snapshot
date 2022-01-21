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
  <UiButton class="text-left w-full mb-1 flex px-3">
    <input
      :value="modelValue"
      @input="
        $emit(
          'update:modelValue',
          $event.target.value.toLowerCase().replaceAll(/\s/g, '')
        )
      "
      class="input flex-auto"
      :placeholder="$t('setup.example')"
    />
    <span
      class="block py-1 -mr-2"
      target="_blank"
      v-tippy="{
        content: `${$t('setup.supportedEnsTLDs')}: ${validEnsTlds.join(', ')}`
      }"
    >
      <Icon name="info" size="24" class="text-color p-1 -mr-1" />
    </span>
  </UiButton>
  <a
    :href="`https://app.ens.domains/name/${modelValue}/register`"
    @click="$emit('waitForRegistration')"
    target="_blank"
  >
    <UiButton :disabled="!isValidDomain" class="w-full mt-2" primary>
      {{ $t('setup.registerEnsButton') }}
    </UiButton>
  </a>
</template>
