<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const { form } = useSpaceSettingsForm();

const emit = defineEmits(['back', 'next']);
</script>

<template>
  <SettingsDomainBlock v-model:domain="form.domain" v-model:skin="form.skin" />
  <BaseButton class="mt-4" @click="emit('back')"> Back </BaseButton>
  <BaseButton primary class="float-right mt-4" @click="emit('next')">
    {{ form.domain ? 'Next' : 'Skip' }}
  </BaseButton>
</template>
