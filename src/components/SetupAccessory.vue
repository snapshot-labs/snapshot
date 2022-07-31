<script setup lang="ts">
defineProps<{
  creatingSpace: boolean;
}>();

const emit = defineEmits(['back', 'next']);
</script>

<template>
  <div class="space-y-3">
    <SettingsAdminsBlock context="setup" />
    <SettingsDomainBlock context="setup" />
    <SettingsSubSpacesBlock context="setup" />
    <SettingsTreasuriesBlock context="setup" />
    <SettingsPluginsBlock context="setup" />
  </div>

  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonCreate
      :creating-space="creatingSpace"
      class="mt-4"
      @create="emit('next')"
    />
  </div>
</template>
