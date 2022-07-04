<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const { form, getErrorMessage } = useSpaceSettingsForm();

const emit = defineEmits(['next', 'back']);
</script>

<template>
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
  <BaseButton primary class="float-right !mt-4" @click="emit('next')">
    Next
  </BaseButton>
  <BaseButton class="mt-4" @click="emit('back')"> Back </BaseButton>
</template>
