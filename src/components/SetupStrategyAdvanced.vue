<script setup lang="ts">
import { useSpaceForm } from '@/composables/useSpaceForm';
const { form, setDefaultStrategy } = useSpaceForm('setup');

const emit = defineEmits(['next']);

function nextStep() {
  emit('next');
  if (!form.value.strategies.length) return setDefaultStrategy();
}
</script>

<template>
  <div>
    <SettingsStrategiesBlock
      context="setup"
      title="Setup your voting strategy"
      hide-error
    />
    <div class="mx-4 md:mx-0">
      <SetupButtonNext
        :text="form.strategies.length ? 'next' : 'skip'"
        @click="nextStep"
      />
    </div>
  </div>
</template>
