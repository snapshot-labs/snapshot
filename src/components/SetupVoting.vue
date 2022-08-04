<script setup lang="ts">
const emit = defineEmits(['next', 'back']);
</script>

<template>
  <div>
    <SettingsVotingBlock context="setup" />
    <div class="px-4 md:px-0">
      <SetupButtonBack @click="emit('back')" />
      <SetupButtonNext @click="emit('next')" />
    </div>
  </div>
</template>
