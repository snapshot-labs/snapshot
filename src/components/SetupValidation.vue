<script setup lang="ts">
defineProps<{
  creatingSpace: boolean;
}>();

const emit = defineEmits(['create', 'back']);
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
    <SetupButtonCreate
      :creating-space="creatingSpace"
      class="mt-4"
      @create="emit('create')"
    />
    <SetupButtonBack @click="emit('back')" />
  </div>
</template>
