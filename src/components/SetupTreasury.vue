<script setup lang="ts">
import { useSpaceForm } from '@/composables';

const { form } = useSpaceForm('setup');

const emit = defineEmits(['next', 'back']);
</script>

<template>
  <SettingsTreasuriesBlock context="setup" />
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonNext
      :text="form.treasuries.length ? 'next' : 'skip'"
      @click="emit('next')"
    />
  </div>
</template>
