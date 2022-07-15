<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const { form } = useSpaceSettingsForm();

const emit = defineEmits(['back', 'next']);
</script>

<template>
  <SettingsDomainBlock v-model:domain="form.domain" v-model:skin="form.skin" />
  <div class="px-4 md:px-0">
    <SetupButtonBack @click="emit('back')" />
    <BaseButton primary class="float-right mt-4" @click="emit('next')">
      {{ form.domain ? $t('next') : $t('skip') }}
    </BaseButton>
  </div>
</template>
