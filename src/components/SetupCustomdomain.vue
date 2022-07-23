<script setup lang="ts">
import { useSpaceForm } from '@/composables/useSpaceForm';

const { form } = useSpaceForm('setup');

const emit = defineEmits(['back', 'next']);
</script>

<template>
  <SettingsDomainBlock context="setup" />
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonNext
      :text="form.domain ? 'next' : 'skip'"
      @click="emit('next')"
    />
  </div>
</template>
