<script setup lang="ts">
import { ExtendedSpace, Proposal, Results } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  results: Results;
  strategies: { name: string; network: string; params: Record<string, any> }[];
  loaded: boolean;
}>();

const ts = Number((Date.now() / 1e3).toFixed());
</script>

<template>
  <BaseBlock
    :loading="!loaded"
    :title="ts >= proposal.end ? $t('results') : $t('currentResults')"
  >
    <ProposalResultsList v-if="results" v-bind="props" />
  </BaseBlock>
</template>
