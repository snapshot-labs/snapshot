<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const { form, getErrorMessage } = useSpaceSettingsForm();

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
    <SettingsValidationBlock
      v-model:validation="form.validation"
      :filters="form.filters"
      @update:min-score="val => (form.filters.minScore = val)"
      @update:only-members="val => (form.filters.onlyMembers = val)"
    />

    <SettingsAdminsBlock
      :admins="form.admins"
      :error="getErrorMessage('admins')"
      @update:admins="val => (form.admins = val)"
    />

    <SettingsAuthorsBlock
      :members="form.members"
      :error="getErrorMessage('members')"
      @update:members="val => (form.members = val)"
    />
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
