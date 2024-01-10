<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';
import { subgraphRequest } from '@snapshot-labs/snapshot.js/src/utils';
import { BigNumber } from '@ethersproject/bignumber';

const props = defineProps<{
  proposal: Proposal;
}>();

const isOpen = ref(false);
const boosts = ref<BoostSubgraphResult[]>([]);
const claims = ref<{ id: string; amount: string }[]>([]);
const loaded = ref(false);

const router = useRouter();
const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();
const { userVote, loadUserVote } = useProposalVotes(props.proposal);
const { web3Account } = useWeb3();

const newBoostLink = computed(() => ({
  name: 'spaceBoost',
  params: { proposalId: props.proposal.id }
}));

const isActive = computed(() => props.proposal.state === 'active');
const isFinal = computed(() => props.proposal.scores_state === 'final');

function isEligible(boost: BoostSubgraphResult) {
  const choice = boost.strategy.params.eligibility.choice;

  if (!web3Account.value) return false;
  if (props.proposal.privacy === 'shutter' && !isFinal.value) return false;
  if (!userVote.value) return false;
  if (choice === null) return true;

  return userVote.value.choice === choice + 1;
}

const eligibleBoosts = computed(() => {
  if (!boosts.value.length) return [];
  return boosts.value.filter(boost => isEligible(boost));
});

const hasUserClaimed = computed(() => {
  if (!eligibleBoosts.value.length) return false;
  const claimsIds = claims.value.map(claim => claim.id.split('.')[0]);
  return eligibleBoosts.value.every(boost => {
    return claimsIds.some(id => BigNumber.from(id).toString() === boost.id);
  });
});

function handleStart() {
  router.push(newBoostLink.value);
  isOpen.value = false;
}

async function loadBoosts() {
  try {
    const { proposal: response } = await subgraphRequest(
      'https://api.thegraph.com/subgraphs/name/snapshot-labs/boost-sepolia',
      {
        proposal: {
          __args: {
            id: props.proposal.id
          },

          boosts: {
            id: true,
            strategyURI: true,
            poolSize: true,
            guard: true,
            start: true,
            end: true,
            owner: true,
            chainId: true,
            token: {
              id: true,
              name: true,
              symbol: true,
              decimals: true
            },
            strategy: {
              name: true,
              params: {
                version: true,
                proposal: true,
                eligibility: {
                  choice: true
                },
                distribution: {
                  type: true
                }
              }
            }
          }
        }
      }
    );

    boosts.value = response.boosts;
    console.log(
      '🚀 ~ file: SpaceProposalBoost.vue:99 ~ loadBoosts ~ boosts.value :',
      boosts.value
    );
  } catch (e) {
    console.log('Load boosts error:', e);
  }
}

async function loadClaims() {
  if (props.proposal.scores_state !== 'final' || !web3Account.value) return;
  try {
    const { claims: response } = await subgraphRequest(
      'https://api.thegraph.com/subgraphs/name/pscott/boost-sepolia',
      {
        claims: {
          __args: {
            where: {
              recipient: '0x3901d0fde202af1427216b79f5243f8a022d68cf'
            }
          },
          id: true,
          amount: true
        }
      }
    );

    claims.value = response;
  } catch (e) {
    console.log('Load boosts error:', e);
  }
}

async function loadAll() {
  loaded.value = false;
  await Promise.all([
    loadUserVote(web3Account.value),
    loadBoosts(),
    loadClaims()
  ]);
  loaded.value = true;
}

watch(
  web3Account,
  async () => {
    loadAll();
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <SpaceProposalBoostClaim
      v-if="eligibleBoosts.length && isFinal && loaded && !hasUserClaimed"
      :proposal="proposal"
      :boosts="boosts"
      :eligible-boosts="eligibleBoosts"
    />

    <TuneBlock
      v-if="isActive || boosts.length"
      slim
      class="rounded-2xl"
      :class="[
        {
          '!border-0 ring-4 ring-snapshot bg-snapshot': isActive
        }
      ]"
    >
      <div
        v-if="isActive"
        class="text-white flex items-center justify-center h-[40px] bg-[url('@/assets/images/stars.png')]"
      >
        <template v-if="boosts.length">
          <i-ho-fire class="text-xs mr-1" />
          <span> {{ boosts.length }} boost active </span>
        </template>
        <template v-else> Try out this feature! </template>
      </div>
      <div class="bg-skin-bg rounded-2xl p-3">
        <div v-if="boosts.length">
          <div class="flex justify-between">
            <div>
              <i-s-boost-logo class="text-xs text-skin-link" />
              <p v-if="isActive" class="text-md leading-5 mt-2">
                Get rewards by voting on this proposal
              </p>
            </div>
            <TuneButton
              v-if="isActive"
              type="button"
              class="flex items-center pl-[18px] pr-[22px]"
              @click="isOpen = true"
            >
              <i-ho-plus class="mr-2 text-xs" />
              <span> New boost </span>
            </TuneButton>
          </div>
          <div v-if="loaded" class="mt-3 space-y-2">
            <div v-for="boost in boosts" :key="boost.id">
              <SpaceProposalBoostItem
                :boost="boost"
                :claims="claims"
                :proposal="proposal"
                :web3-account="web3Account"
                :is-eligible="isEligible(boost)"
              />
            </div>
          </div>
          <LoadingList v-else class="mt-3" />
          <div
            v-if="eligibleBoosts.length && isActive"
            class="bg-[--border-color-faint] border-t border-[--border-color-soft] -mx-3 -mb-3 mt-3 p-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-[46px] w-[46px] flex-shrink-0 rounded-2xl shadow-xl"
              >
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
                      formatRelativeTime(
                        proposal.end,
                        longRelativeTimeFormatter
                      )
                    }}
                  </div>
                </div>
              </TuneButton>
            </div>
          </div>
        </div>
        <div v-else-if="isActive" class="flex items-center gap-3">
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
    </TuneBlock>
    <SpaceProposalBoostModal
      :open="isOpen"
      @close="isOpen = false"
      @start="handleStart"
    />
  </div>
</template>