<script setup lang="ts">
import { BoostSubgraphResult, Proposal } from '@/helpers/interfaces';
import { Reward } from '@/helpers/boost/api';
import { BoostClaimSubgraph } from '@/helpers/boost/types';

defineProps<{
  open: boolean;
  boosts: BoostSubgraphResult[];
  boostsOwner: BoostSubgraphResult[];
  claims: BoostClaimSubgraph[];
  proposal: Proposal;
  rewards: Reward[];
  isEligible: (boost: BoostSubgraphResult) => boolean;
}>();

defineEmits(['close']);

const { web3Account } = useWeb3();
</script>

<template>
  <TuneModal size="medium" :open="open" @close="$emit('close')">
    <TuneModalTitle as="h4" class="flex items-center gap-1 m-3">
      Boosts <TuneTag label="4" class="leading-none rounded-full px-2" />
    </TuneModalTitle>
    <div
      class="p-3 pt-0 space-y-2 max-h-[calc(100vh-130px)] md:max-h-[488px] overflow-y-scroll"
    >
      <SpaceProposalBoostOwner
        v-if="boostsOwner.length"
        :boosts="boostsOwner"
        :proposal="proposal"
      />
      <div v-for="boost in boosts" :key="boost.id">
        <SpaceProposalBoostItem
          :boost="boost"
          :claims="claims"
          :proposal="proposal"
          :web3-account="web3Account"
          :reward="
            rewards.find(
              reward =>
                reward.boost_id === boost.id &&
                reward.chain_id === boost.chainId
            )
          "
          :is-eligible="isEligible(boost)"
        />
      </div>
    </div>
  </TuneModal>
</template>
