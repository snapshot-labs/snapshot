<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';
import { useRouter } from 'vue-router';

const { form } = useSpaceSettingsForm();
const router = useRouter();

function nextStep() {
  router.push({ query: { step: '7' } });
}
</script>

<template>
  <SettingsDomainBlock v-model:domain="form.domain" v-model:skin="form.skin" />
  <BaseButton primary class="float-right mt-4" @click="nextStep">
    {{ form.domain ? 'Next' : 'Skip' }}
  </BaseButton>
</template>
