<script setup lang="ts">
defineProps<{
  creatingSpace: boolean;
}>();
const emit = defineEmits(['next', 'back']);
</script>

<template>
  <SettingsPluginsBlock context="setup" />
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonCreate
      :creating-space="creatingSpace"
      class="mt-4"
      @create="emit('next')"
    />
  </div>
</template>
