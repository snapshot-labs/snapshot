<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const { form } = useSpaceSettingsForm();

const emit = defineEmits(['back', 'next']);
</script>

<template>
  <SettingsDomainBlock v-model:domain="form.domain" v-model:skin="form.skin" />
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <SetupButtonNext
      :text="form.domain ? 'next' : 'skip'"
      @click="emit('next')"
    />
  </div>
</template>
