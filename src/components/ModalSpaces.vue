<script setup lang="ts">
import { Space } from '@/helpers/interfaces';

defineProps<{
  open: boolean;
  spaces: Space[];
}>();

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('spaces') }}</h3>
      </div>
    </template>
    <div class="space-y-3 py-4 md:px-4">
      <div v-for="space in spaces" :key="space.id">
        <ModalSpacesListItem :space="space" />
      </div>
    </div>
  </BaseModal>
</template>
