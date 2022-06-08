<script setup lang="ts">
import { defineEmits } from 'vue';
import { useSpaces } from '@/composables/useSpaces';

const { spaces } = useSpaces();

defineProps<{
  open: boolean;
  followingSpaces: string[];
}>();

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <div class="flex flex-row items-center justify-center">
        <h3>{{ $t('spaces') }}</h3>
      </div>
    </template>

    <div class="space-y-3 py-4 md:px-4">
      <div v-for="space in followingSpaces" :key="space">
        <ModalSpacesListItem v-if="spaces[space]" :space="spaces[space]" />
      </div>
    </div>
  </BaseModal>
</template>
