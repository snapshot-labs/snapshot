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
  <UiButton class="text-left w-full mb-1 flex px-3 items-center">
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
      class="-mr-2 flex items-center"
      target="_blank"
      v-tippy="{
        content: `${$t('setup.supportedEnsTLDs')}: ${validEnsTlds.join(', ')}`
      }"
    >
      <BaseIcon name="info" size="24" class="text-skin-text -mr-1" />
    </span>
  </UiButton>
  <BaseLink
    @click="$emit('waitForRegistration')"
    :link="`https://app.ens.domains/name/${modelValue}/register`"
    hide-external-icon
  >
    <UiButton :disabled="!isValidDomain" class="w-full mt-2" primary>
      {{ $t('setup.registerEnsButton') }}
    </UiButton>
  </BaseLink>
</template>
