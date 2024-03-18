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
  <TuneModal :open="open" @close="$emit('close')">
    <TuneModalTitle class="my-3 px-3">
      {{ $t('strategiesPage') }}
    </TuneModalTitle>
    <div
      class="max-h-[calc(100vh-175px)] md:max-h-[488px] overflow-y-auto space-y-3 px-3"
    >
      <StrategiesListItem
        v-for="(strategy, i) in strategies"
        :key="i"
        :strategy="strategy"
        :proposal="proposal"
      />
    </div>

    <div class="px-3 py-3">
      <TuneButton class="w-full" @click="$emit('close')"> Close </TuneButton>
    </div>
  </TuneModal>
</template>
