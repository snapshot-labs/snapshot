<script setup lang="ts">
const emit = defineEmits(['next', 'back']);

const { validationErrors, forceShowError } = useFormSpaceSettings('setup');

function nextStep() {
  if (
    ['name', 'website', 'terms', 'twitter', 'github', 'coingecko'].some(item =>
      Object.keys(validationErrors.value).includes(item)
    )
  )
    return forceShowError();
  emit('next');
}
</script>

<template>
  <div class="space-y-4">
    <SettingsProfileBlock context="setup" />

    <SettingsLinkBlock context="setup" />
  </div>
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonNext @click="nextStep" />
  </div>
</template>
