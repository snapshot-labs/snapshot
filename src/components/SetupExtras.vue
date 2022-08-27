<script setup lang="ts">
import { useClient } from '@/composables';

const { isGnosisSafe } = useClient();

defineProps<{
  creatingSpace: boolean;
}>();

const emit = defineEmits(['next', 'back']);
</script>

<template>
  <div v-if="isGnosisSafe" class="space-y-4">
    <SettingsAdminsBlock context="setup" />

    <SettingsAuthorsBlock context="setup" />

    <SettingsVotingBlock context="setup" />

    <SettingsValidationBlock context="setup" />

    <SettingsDomainBlock context="setup" />

    <SettingsSubSpacesBlock context="setup" />

    <SettingsTreasuriesBlock context="setup" />

    <SettingsPluginsBlock context="setup" />
  </div>
  <div v-else class="space-y-4">
    <h4 class="-mb-2 px-4 md:px-0">
      {{ $t('setup.validationTitle') }}
    </h4>
    <SettingsAdminsBlock context="setup" />

    <SettingsAuthorsBlock context="setup" />
  </div>

  <div class="px-4 md:px-0">
    <SetupButtonCreate
      :creating-space="creatingSpace"
      class="mt-4"
      @create="emit('next')"
    />
    <SetupButtonBack @click="emit('back')" />
  </div>
</template>
