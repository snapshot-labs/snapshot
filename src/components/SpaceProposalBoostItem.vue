<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
  boost: BoostSubgraphResult;
}>();
</script>

<template>
  <div class="border rounded-xl p-[12px]">
    <div class="text-skin-heading">
      Who votes
      <TuneTag
        :label="proposal.choices[boost.strategy.params.eligibility]"
        class="text-skin-heading"
      />
      share a pool of
      <TuneTag
        :label="`${boost.balance} ${boost.token.symbol}`"
        class="text-skin-heading"
      />
      based on
      <TuneTag label="Voting power" class="text-skin-heading" />
    </div>
    <div class="flex items-center mt-1">
      <i-ho-lock-closed class="mr-1 text-xs" />
      Secured by Snapshot
    </div>
  </div>
</template>
