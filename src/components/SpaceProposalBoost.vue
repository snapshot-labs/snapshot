<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
}>();

const SAMPLE_BOOST = {
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
    strategy: 'strategyABC',
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
  <div class="border rounded-xl">
    <div v-if="SAMPLE_BOOST" class="p-3">
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
        <div class="border rounded-xl p-[12px]">
          <div class="text-skin-heading">
            Who votes
            <TuneTag
              :label="
                proposal.choices[SAMPLE_BOOST.strategy.params.eligibility]
              "
              class="text-skin-heading"
            />
            share a pool of
            <TuneTag
              :label="`${SAMPLE_BOOST.balance} ${SAMPLE_BOOST.token.symbol}`"
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
      </div>
    </div>
    <div v-else class="py-[32px]">
      <div
        class="h-[56px] w-[56px] flex items-center justify-center rounded-[14px] shadow-xl mx-auto"
      >
        <i-ho-lightning-bolt class="text-base" />
      </div>
      <div class="mx-auto w-[280px] text-center mt-3">
        <h4>Boost proposal</h4>
        <p class="leading-5 mt-[2px]">
          Incentivize people to vote by rewarding voters with a custom logic.
        </p>
        <router-link :to="newBoostLink">
          <TuneButton class="mt-3 text-skin-text"> Boost proposal </TuneButton>
        </router-link>
      </div>
    </div>
  </div>
</template>
