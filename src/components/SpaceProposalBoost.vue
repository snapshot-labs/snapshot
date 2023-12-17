<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';

const props = defineProps<{
  proposal: Proposal;
}>();

const router = useRouter();
const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();
const { userVote, loadUserVote } = useProposalVotes(props.proposal);
const { web3Account } = useWeb3();

const isOpen = ref(false);

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
          choice: 0
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

const SAMPLE_BOOSTS_REWARDS = [
  {
    boost_id: '0x1234',
    chain_id: '1',
    reward: '123456000000'
  },
  {
    boost_id: '0x1235',
    chain_id: '1',
    reward: '7323000000'
  }
];

const newBoostLink = computed(() => ({
  name: 'spaceBoost',
  params: { proposalId: props.proposal.id }
}));

const isActive = computed(() => props.proposal.state === 'active');

function isEligible(boost: BoostSubgraphResult) {
  if (userVote.value && boost.strategy.params.eligibility.choice !== undefined)
    return (
      userVote.value.choice === boost.strategy.params.eligibility.choice + 1
    );
  if (userVote.value && boost.strategy.params.eligibility.choice === undefined)
    return true;
  return false;
}

const eligibleBoosts = computed(() => {
  return SAMPLE_BOOSTS.filter(boost => isEligible(boost));
});

function handleStart() {
  router.push(newBoostLink.value);
  isOpen.value = false;
}

watch(
  web3Account,
  () => {
    loadUserVote(web3Account.value);
  },
  { immediate: true }
);
</script>

<template>
  <TuneBlock
    v-if="!isActive"
    slim
    class="bg-snapshot bg-[url('@/assets/images/stars-big-horizontal.png')] h-[250px] py-[32px]"
  >
    <div>
      <div
        class="bg-white w-[64px] h-[64px] rounded-[20px] flex justify-center items-center shadow-xl mx-auto relative"
      >
        <i-s-boost-icon class="text-black text-[20px]" />
        <div
          class="absolute bg-white border -top-[10px] -right-3 border-[#000000]/10 rounded-full flex items-center pr-2 pl-[6px] text-[#444]"
        >
          <i-ho-gift class="text-[14px] mr-[2px]" />
          <span class="text-sm">
            {{ eligibleBoosts.length }}
          </span>
        </div>
      </div>
      <div class="text-white text-md text-center leading-5 mt-3">
        <div class="font-semibold mb-1">Claim rewards</div>
        You can now claim your rewards!
      </div>
    </div>

    <div class="flex justify-center mt-3">
      <TuneButton variant="white" class="text-white flex items-center">
        <i-ho-gift class="text-sm mr-2" />
        Claim now
      </TuneButton>
    </div>
  </TuneBlock>
  <TuneBlock
    slim
    class="rounded-2xl"
    :class="[
      {
        '!border-0 ring-4 ring-snapshot bg-snapshot': isActive
      }
    ]"
  >
    <div
      v-if="proposal.state === 'active'"
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
            <p v-if="isActive" class="text-md">
              Get rewards by voting on this proposal
            </p>
          </div>
          <button
            v-if="isActive"
            type="button"
            class="flex items-center absolute -top-[12px] -right-2 p-2"
            @click="isOpen = true"
          >
            <i-ho-plus class="mr-2 text-xs" />
            <span class="text-md"> New boost </span>
          </button>
        </div>
        <div class="mt-3 space-y-2">
          <div v-for="boost in SAMPLE_BOOSTS" :key="boost.id">
            <SpaceProposalBoostItem
              :boost="boost"
              :proposal="proposal"
              :is-eligible="isEligible(boost)"
            />
          </div>
        </div>
        <div
          v-if="eligibleBoosts.length && isActive"
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
                You’re eligible to {{ eligibleBoosts.length }} boost rewards
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
          <p>Incentivize people to vote with rewards</p>
        </div>

        <TuneButton class="flex items-center" @click="isOpen = true">
          <i-ho-fire class="text-sm mr-2" />
          <div>Boost</div>
        </TuneButton>
      </div>
    </div>
    <SpaceProposalBoostModal
      :open="isOpen"
      @close="isOpen = false"
      @start="handleStart"
    />
  </TuneBlock>
</template>
