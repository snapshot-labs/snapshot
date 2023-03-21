<script setup lang="ts">
import { Proposal, SpaceStrategy } from '@/helpers/interfaces';

defineProps<{
  open: boolean;
  strategies: SpaceStrategy[];
  proposal?: Proposal;
}>();

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('strategiesPage') }}</h3>
    </template>
    <div class="m-4">
      <StrategiesListItem
        v-for="(strategy, i) in strategies"
        :key="i"
        :strategy="strategy"
        :proposal="proposal"
      />
    </div>
  </BaseModal>
</template>
