<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const emit = defineEmits(['next', 'back']);

const { form, showAllValidationErrors, getErrorMessage } =
  useSpaceSettingsForm();

function nextStep() {
  if (!form.value.name) return (showAllValidationErrors.value = true);
  emit('next');
}
</script>

<template>
  <div class="space-y-4">
    <SettingsProfileBlock
      v-model:name="form.name"
      v-model:about="form.about"
      v-model:categories="form.categories"
      v-model:avatar="form.avatar"
      v-model:private="form.private"
      v-model:terms="form.terms"
      v-model:website="form.website"
      :get-error-message="getErrorMessage"
    />

    <SettingsLinkBlock
      v-model:twitter="form.twitter"
      v-model:github="form.github"
      :get-error-message="getErrorMessage"
    />
  </div>
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonNext @click="nextStep" />
  </div>
</template>
