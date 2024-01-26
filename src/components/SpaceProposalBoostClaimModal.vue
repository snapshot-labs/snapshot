<script setup lang="ts">
import {
  BoostClaimSubgraph,
  BoostRewardGuard,
  BoostSubgraph
} from '@/helpers/boost/types';

const props = defineProps<{
  open: boolean;
  boosts: BoostSubgraph[];
  claims: BoostClaimSubgraph[];
  rewards: BoostRewardGuard[];
  loadingClaimAll: boolean;
  loadingClaim?: { [key: string]: string };
}>();

defineEmits(['close', 'claimAll', 'claim']);

const allOnSameNetwork = computed(() => {
  const chainIds = new Set(props.boosts.map(boost => boost.chainId));
  return chainIds.size === 1;
});
</script>

<template>
  <TuneModal :open="open" @close="$emit('close')">
    <div class="px-[64px] py-[32px] text-center">
      <TuneModalIndicator variant="gift" />
      <TuneModalTitle as="h4" class="mt-3 leading-none">
        Claim your rewards
      </TuneModalTitle>
      <TuneModalDescription class="text-md leading-none mt-1">
        You can now claim your rewards!
      </TuneModalDescription>
    </div>
    <div
      class="px-3 space-y-2 max-h-[calc(100vh-130px)] md:max-h-[200px] overflow-y-auto"
    >
      <div v-for="boost in boosts" :key="boost.id">
        <SpaceProposalBoostClaimModalItem
          :boost="boost"
          :rewards="rewards"
          :claims="claims"
          :loading="loadingClaim"
          @claim="$emit('claim', boost)"
        />
      </div>
    </div>
    <div class="m-3">
      <TuneButton
        v-if="allOnSameNetwork && boosts.length > 1"
        class="w-full"
        :loading="loadingClaimAll"
        @click="$emit('claimAll')"
      >
        Claim all
      </TuneButton>
    </div>
  </TuneModal>
</template>
