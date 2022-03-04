<script setup>
import { onMounted } from 'vue';
import { SpaceExplorer } from '@snapshot-labs/components';
import { useI18n } from '@/composables/useI18n';

const { setPageTitle } = useI18n();

onMounted(() => {
  setPageTitle('page.title.home');
});
</script>

<template>
  <SpaceExplorer />
</template>
