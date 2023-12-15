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
      <template v-if="boost.strategy.params.eligibility.choice">
        Who votes
        <TuneTag
          :label="proposal.choices[boost.strategy.params.eligibility.choice]"
          class="text-skin-heading"
        />
      </template>
      <template v-else> Voters </template>
      share a pool of
      <TuneTag
        :label="`${boost.balance} ${boost.token.symbol}`"
        class="text-skin-heading"
      />
      <template v-if="boost.strategy.params.distribution.type === 'weighted'">
        based on
        <TuneTag label="Voting power" class="text-skin-heading" />
      </template>
    </div>
    <div class="flex items-center mt-1">
      <i-ho-lock-closed class="mr-1 text-xs" />
      Secured by Snapshot
    </div>
  </div>
</template>
