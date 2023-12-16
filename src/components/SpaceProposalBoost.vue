<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
}>();

const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();

const SAMPLE_BOOSTS: BoostSubgraphResult[] = [
  {
    id: '0x1234',
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
      strategy: 'proposal',
      params: {
        proposal: '0x123',
        eligibility: {
          choice: 1
        },
        distribution: {
          type: 'even',
          limit: undefined
        }
      }
    }
  },
  {
    id: '0x1235',
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
      strategy: 'proposal',
      params: {
        proposal: '0x123',
        eligibility: {
          choice: undefined
        },
        distribution: {
          type: 'weighted',
          limit: 100
        }
      }
    }
  },
  {
    id: '0x1236',
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
      strategy: 'proposal',
      params: {
        proposal: '0x123',
        eligibility: {
          choice: undefined
        },
        distribution: {
          type: 'even',
          limit: undefined
        }
      }
    }
  }
];

const SAMPLE_BOOSTS_ELIGIBLE = [
  {
    boost_id: '0x1234',
    chain_id: '1',
    sig: '0x13374242'
  },
  {
    boost_id: '0x1236',
    chain_id: '2',
    sig: '0x123142412'
  }
];

const newBoostLink = computed(() => ({
  name: 'spaceBoost',
  params: { proposalId: props.proposal.id }
}));
</script>

<template>
  <TuneBlock
    slim
    class="rounded-2xl !border-0 ring-4 ring-snapshot bg-snapshot"
  >
    <div
      class="text-white flex items-center justify-center h-[40px] bg-[url('@/assets/images/stars.png')]"
    >
      <template v-if="SAMPLE_BOOSTS.length">
        <i-ho-fire class="text-xs mr-1" />
        <span> {{ SAMPLE_BOOSTS.length }} boost active </span>
      </template>
      <template v-else> Try out this feature! </template>
    </div>
    <div class="bg-skin-bg rounded-2xl p-3">
      <div v-if="SAMPLE_BOOSTS.length">
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
        <div class="mt-3 space-y-2">
          <div v-for="boost in SAMPLE_BOOSTS" :key="boost.id">
            <SpaceProposalBoostItem
              :boost="boost"
              :proposal="proposal"
              :is-eligible="
                SAMPLE_BOOSTS_ELIGIBLE.some(b => b.boost_id === boost.id)
              "
            />
          </div>
        </div>
        <div
          v-if="SAMPLE_BOOSTS_ELIGIBLE.length"
          class="bg-[--border-color-faint] border-t border-[--border-color-soft] -mx-3 -mb-3 mt-3 p-3"
        >
          <div class="flex items-center gap-3">
            <div class="h-[46px] w-[46px] flex-shrink-0 rounded-2xl shadow-xl">
              <div class="flex items-center justify-center h-full">
                <i-ho-gift class="text-skin-heading" />
              </div>
            </div>
            <div class="w-full">
              <h4 class="leading-5">Rewards</h4>
              <p class="">
                You’re eligible to {{ SAMPLE_BOOSTS_ELIGIBLE.length }} boost
                rewards
              </p>
            </div>

            <TuneButton disabled>
              <div class="text-skin-link flex items-center opacity-40">
                <i-ho-fire class="text-sm mr-2" />
                <div class="whitespace-nowrap">
                  Claim
                  {{
                    formatRelativeTime(proposal.end, longRelativeTimeFormatter)
                  }}
                </div>
              </div>
            </TuneButton>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center gap-3">
        <div class="h-[46px] w-[46px] flex-shrink-0 rounded-2xl shadow-xl">
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
