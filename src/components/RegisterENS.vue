<script setup>
/**
 * A combo-input, text and dropdown with available TLDs.
 */

import { useEns } from '@/composables/useEns';

const { validEnsTlds } = useEns();

defineProps({
  name: String,
  tld: String
});

defineEmits(['update:name', 'update:tld', 'waitForRegistration']);
</script>

<template>
  <UiButton class="text-left w-full mb-3 flex px-3">
    <input
      :value="name"
      @input="$emit('update:name', $event.target.value.toLowerCase().replaceAll(/\s/g, ''))"
      class="input flex-auto"
      :placeholder="$t('setup.example')"
    />
    <div class="border-l" style="height: 44px">
      <UiDropdown
        top="3.5rem"
        right="1.0rem"
        class="text-left"
        style="z-index: 1"
        @select="$emit('update:tld', $event)"
        :items="validEnsTlds.map(tld => ({ text: '.' + tld, action: tld }))"
      >
        <span class="ml-3">.{{ tld }}</span>
        <Icon name="arrow-down" class="ml-1" />
      </UiDropdown>
    </div>
  </UiButton>
  <a
    :href="`https://app.ens.domains/name/${name}.${tld}/register`"
    @click="$emit('waitForRegistration')"
    target="_blank"
  >
    <UiButton :disabled="!name" class="w-full mt-2" primary>
      {{ $t('setup.registerEnsButton') }}
      <span v-if="name"> {{ name }}.{{ tld }} </span>
    </UiButton>
  </a>
</template>
