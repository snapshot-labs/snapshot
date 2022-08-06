<script setup lang="ts">
const emit = defineEmits(['next', 'back']);
</script>

<template>
  <h4 class="mb-2 px-4 md:px-0">
    {{ $t('setup.validationTitle') }}
  </h4>
  <div class="space-y-4">
    <SettingsValidationBlock context="setup" />

    <SettingsAdminsBlock context="setup" />

    <SettingsAuthorsBlock context="setup" />
  </div>
  <div class="px-4 md:px-0">
    <SetupButtonNext text="next" @click="emit('next')" />
    <SetupButtonBack @click="emit('back')" />
  </div>
</template>
