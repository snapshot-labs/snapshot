<script setup lang="ts">
const { validationErrors } = useFormSpaceSettings('setup');

const emit = defineEmits(['next']);

function nextStep() {
  if (validationErrors.value.strategies) return;
  emit('next');
}
</script>

<template>
  <div>
    <SettingsStrategiesBlock
      context="setup"
      :title="$t('setup.strategy.blockTitle')"
      hide-error
    />
    <div class="mx-4 md:mx-0">
      <SetupButtonNext @click="nextStep" />
    </div>
  </div>
</template>
