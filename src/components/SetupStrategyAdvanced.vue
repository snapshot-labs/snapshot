<script setup lang="ts">
const { validationErrors } = useFormSpaceSettings('setup');

const emit = defineEmits(['next']);

const showErrors = ref(false);

function nextStep() {
  if (validationErrors.value.strategies || validationErrors.value.symbol)
    return (showErrors.value = true);
  emit('next');
}
</script>

<template>
  <div>
    <SettingsStrategiesBlock
      context="setup"
      :title="$t('setup.strategy.blockTitle')"
      :show-errors="showErrors"
    />
    <div class="mx-4 md:mx-0">
      <SetupButtonNext @click="nextStep" />
    </div>
  </div>
</template>
