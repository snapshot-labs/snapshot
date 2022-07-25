<script setup lang="ts">
import { useSpaceForm } from '@/composables/useSpaceForm';

const emit = defineEmits(['next', 'back']);

const { form, showAllValidationErrors } = useSpaceForm('setup');

function nextStep() {
  if (!form.value.name) return (showAllValidationErrors.value = true);
  emit('next');
}
</script>

<template>
  <div class="space-y-4">
    <SettingsProfileBlock context="setup" />

    <SettingsLinkBlock context="setup" />

    <!-- WIP: <SettingsSubSpacesBlock
      v-model:parent="form.parent"
      v-model:children="form.children"
    /> -->
  </div>
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonNext @click="nextStep" />
  </div>
</template>
