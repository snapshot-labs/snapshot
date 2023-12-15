<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
}>();

const SAMPLE_BOOST: BoostSubgraphResult = {
  id: '0x123',
  strategyURI: 'ipfs://cid',
  balance: 1000,
  guard: '0x123',
  start: '1712182473',
  end: '1762192473',
  owner: '0x123',
  chainId: '1',
  token: {
    address: '0x123',
    name: 'TokenName',
    symbol: 'TN',
    decimals: 18
  },
  strategy: {
    strategy: 'snapshot',
    params: {
      eligibility: 1
    }
  }
};

const newBoostLink = computed(() => ({
  name: 'spaceBoost',
  params: { proposalId: props.proposal.id }
}));
</script>

<template>
  <TuneBlock slim class="border rounded-xl bg-skin-border p-1 pt-0">
    <div class="text-skin-heading flex items-center justify-center h-[40px]">
      <template v-if="[SAMPLE_BOOST].length">
        <i-ho-fire class="text-xs mr-1" />
        <span> 1 boost active </span>
      </template>
      <template v-else> Try out this feature! </template>
    </div>
    <div class="bg-skin-bg rounded-xl p-3">
      <div v-if="false">
        <div class="flex justify-between relative">
          <div>
            <i-s-boost-logo class="text-xs text-skin-link" />
            <p class="text-md">Get rewards by voting on this proposal</p>
          </div>
          <router-link
            :to="newBoostLink"
            class="flex items-center absolute -top-[12px] -right-2 p-2"
          >
            <i-ho-plus class="mr-2 text-xs" />
            <span class="text-md"> New boost </span>
          </router-link>
        </div>
        <div class="mt-3">
          <SpaceProposalBoostItem :boost="SAMPLE_BOOST" :proposal="proposal" />
        </div>
      </div>
      <div v-else class="flex items-center gap-3">
        <div class="h-[46px] w-[46px] flex-shrink-0 rounded-[14px] shadow-xl">
          <div class="flex items-center justify-center h-full">
            <i-s-boost-icon class="text-skin-heading" />
          </div>
        </div>
        <div class="w-full">
          <h4 class="leading-5">Boost proposal</h4>
          <p class="">Incentivize people to vote with rewards</p>
        </div>
        <router-link :to="newBoostLink">
          <TuneButton class="flex items-center">
            <i-ho-fire class="text-sm mr-2" />
            <div>Boost</div>
          </TuneButton>
        </router-link>
      </div>
    </div>
  </TuneBlock>
</template>
