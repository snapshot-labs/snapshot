<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';
const { form, setDefaultStrategy, getErrorMessage } =
  useSpaceSettingsForm('setup');

const emit = defineEmits(['next']);

function nextStep() {
  emit('next');
  if (!form.value.strategies.length) return setDefaultStrategy();
}
</script>

<template>
  <div>
    <SettingsStrategiesBlock
      title="Setup your voting strategy"
      :form="form"
      :get-error-message="getErrorMessage"
      hide-error
      @update-strategies="val => (form.strategies = val)"
      @update-network="val => (form.network = val)"
      @update-symbol="val => (form.symbol = val)"
    />
    <div class="mx-4 md:mx-0">
      <SetupButtonNext
        :text="form.strategies.length ? 'next' : 'skip'"
        @click="nextStep"
      />
    </div>
  </div>
</template>
