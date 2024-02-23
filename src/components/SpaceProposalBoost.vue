<script setup lang="ts">
import { getClaims, getBoosts } from '@/helpers/boost/subgraph';
import { SUPPORTED_NETWORKS } from '@/helpers/boost';
import { Proposal } from '@/helpers/interfaces';
import { useStorage } from '@vueuse/core';
import { getRewards } from '@/helpers/boost/api';
import { toChecksumAddress } from '@/helpers/utils';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import {
  BoostClaimSubgraph,
  BoostRewardGuard,
  BoostSubgraph
} from '@/helpers/boost/types';

const INITIAL_VISIBLE_BOOSTS = 3;

const props = defineProps<{
  proposal: Proposal;
}>();

const createModalOpen = ref(false);
const showAllBoosts = ref(false);
const boosts = ref<BoostSubgraph[]>([]);
const boostClaims = ref<BoostClaimSubgraph[]>([]);
const boostRewards = ref<BoostRewardGuard[]>([]);
const loaded = ref(false);
const loadingRewards = ref(false);
const relativeEndTime = ref('');

const router = useRouter();
const { formatRelativeTime, longRelativeTimeFormatter } = useIntl();
const { userVote, loadUserVote } = useProposalVotes(props.proposal);
const { web3Account } = useWeb3();
const { bribeDisabled } = useBoost({ spaceId: props.proposal.space.id });
const dontShowModalAgain = useStorage(
  'snapshot.boosts-modal-dont-show-again',
  false
);

const newBoostLink = computed(() => ({
  name: 'spaceBoost',
  params: { proposalId: props.proposal.id }
}));

const isActive = computed(() => props.proposal.state === 'active');
const isFinal = computed(() => props.proposal.scores_state === 'final');

function isEligible(boost: BoostSubgraph) {
  const choice = boost.strategy.eligibility.choice;

  if (!web3Account.value) return false;
  if (props.proposal.privacy === 'shutter' && !isFinal.value) return false;
  if (!userVote.value) return false;
  if (choice === null) return true;

  return userVote.value.choice.toString() === choice;
}

const eligibleBoosts = computed(() => {
  if (!boosts.value.length) return [];
  return boosts.value.filter(boost => isEligible(boost));
});

const boostsSorted = computed(() => {
  if (!boosts.value.length) return [];

  const boostsWithReward = boosts.value.map(boost => {
    const reward = boostRewards.value.find(
      reward =>
        reward.boost_id === boost.id && reward.chain_id === boost.chainId
    );
    return {
      ...boost,
      rewardAmount: reward ? reward.reward : 0
    };
  });

  const owned: BoostSubgraph[] = [];
  const eligible: BoostSubgraph[] = [];
  const claimed: BoostSubgraph[] = [];
  const other: BoostSubgraph[] = [];

  boostsWithReward.forEach(boost => {
    const isClaimed = boostClaims.value.some(
      claim => claim.boost.id === boost.id
    );

    if (
      toChecksumAddress(boost.owner) === toChecksumAddress(web3Account.value)
    ) {
      owned.push(boost);
    } else if (isEligible(boost) && !isClaimed) {
      eligible.push(boost);
    } else if (isClaimed) {
      claimed.push(boost);
    } else {
      other.push(boost);
    }
  });

  const sortFn = (a, b) => Number(b.rewardAmount) - Number(a.rewardAmount);
  return [
    ...owned.sort(sortFn),
    ...eligible.sort(sortFn),
    ...claimed.sort(sortFn),
    ...other.sort(sortFn)
  ];
});

function handleStart() {
  router.push(newBoostLink.value);
  createModalOpen.value = false;
}

async function loadBoosts() {
  try {
    const response = await getBoosts([props.proposal.id]);
    const cleanBoosts = response.filter(boost => {
      if (bribeDisabled.value) {
        return boost.strategy.eligibility.type !== 'bribe';
      }
    });
    boosts.value = cleanBoosts;
    console.log('🚀 ~ loadBoosts ~ boosts.value:', boosts.value);
  } catch (e) {
    console.error('Load boosts error:', e);
  }
}

async function loadClaims() {
  if (!isFinal.value || !web3Account.value) return;
  try {
    boostClaims.value = await getClaims(web3Account.value);
    console.log('🚀 ~ loadClaims ~ boostClaims.value:', boostClaims.value);
  } catch (e) {
    console.error('Load boosts error:', e);
  }
}

function handleBoost() {
  if (dontShowModalAgain.value) {
    handleStart();
  } else {
    createModalOpen.value = true;
  }
}

async function loadRewards() {
  if (
    !web3Account.value ||
    !isFinal.value ||
    !userVote.value ||
    !boosts.value.length
  ) {
    return;
  }

  loadingRewards.value = true;

  try {
    boostRewards.value = await getRewards(
      props.proposal.id,
      web3Account.value,
      boosts.value
    );
  } catch (e) {
    boostRewards.value = [];
    console.log('Get boostRewards error:', e);
  } finally {
    loadingRewards.value = false;
  }

  console.log(
    '🚀 ~ file: SpaceProposalBoost.vue:153 ~ loadRewards ~ boostRewards:',
    boostRewards.value
  );
}

watch(
  [() => props.proposal],
  async () => {
    loaded.value = false;
    await Promise.all([
      loadBoosts(),
      loadClaims(),
      loadUserVote(web3Account.value)
    ]);
    await loadRewards();
    loaded.value = true;
  },
  { immediate: true, deep: true }
);

watch(web3Account, async value => {
  if (!loaded.value) return;
  loadClaims();
  await loadUserVote(value);
  loadRewards();
});

onMounted(() => {
  if (!isActive.value) return;

  const interval = setInterval(async () => {
    relativeEndTime.value = formatRelativeTime(
      props.proposal.end,
      longRelativeTimeFormatter.value
    );

    const timestampNow = Math.floor(Date.now() / 1000);
    const isClaimable = props.proposal.end < timestampNow;
    if (isClaimable) {
      clearInterval(interval);
      await sleep(3000);
      window.location.reload();
    }
  }, 1000);

  onUnmounted(() => {
    clearInterval(interval);
  });
});
</script>

<template>
  <div>
    <SpaceProposalBoostClaim
      v-if="eligibleBoosts.length && loaded && isFinal"
      :proposal="proposal"
      :boosts="boosts"
      :eligible-boosts="eligibleBoosts"
      :rewards="boostRewards"
      :claims="boostClaims"
      :loading-rewards="loadingRewards"
      @reload="loadClaims"
    />

    <TuneBlock
      v-if="isActive || boosts.length"
      slim
      class="rounded-2xl mx-4 md:mx-0"
      :class="[
        {
          '!border-0 ring-1 ring-boost !bg-boost': isActive
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
          <div class="md:flex md:justify-between">
            <div>
              <i-s-boost-logo class="text-xs text-skin-link" />
              <p v-if="isActive" class="text-md leading-5 mt-2">
                Get rewards by voting on this proposal
              </p>
            </div>
            <TuneButton
              v-if="isActive"
              type="button"
              class="flex items-center pl-[18px] pr-[22px] w-full md:w-auto justify-center mt-[12px] md:mt-0"
              @click="handleBoost"
            >
              <i-ho-plus class="mr-2 text-xs" />
              <span> New boost </span>
            </TuneButton>
          </div>
          <div v-if="loaded">
            <div class="mt-3 space-y-2">
              <div
                v-for="boost in showAllBoosts
                  ? boostsSorted
                  : boostsSorted.slice(0, INITIAL_VISIBLE_BOOSTS)"
                :key="boost.id"
              >
                <SpaceProposalBoostItem
                  :boost="boost"
                  :claims="boostClaims"
                  :proposal="proposal"
                  :reward="
                    boostRewards.find(
                      reward =>
                        reward.boost_id === boost.id &&
                        reward.chain_id === boost.chainId
                    )
                  "
                  :is-eligible="isEligible(boost)"
                  @reload="loadBoosts()"
                />
              </div>
            </div>
            <TuneButton
              v-if="
                boostsSorted.length > INITIAL_VISIBLE_BOOSTS && !showAllBoosts
              "
              class="w-full mt-3 flex items-center justify-center"
              @click="showAllBoosts = true"
            >
              View more
              <i-ho-arrow-sm-down class="ml-2" />
            </TuneButton>
          </div>
          <LoadingList v-else class="mt-3" />
          <div
            v-if="eligibleBoosts.length && isActive"
            class="bg-[--border-color-faint] border-t border-[--border-color-soft] -mx-3 -mb-3 mt-3 p-3"
          >
            <div class="md:flex md:items-center gap-3">
              <div class="flex gap-[12px] items-center w-full">
                <div
                  class="h-[44px] w-[44px] flex-shrink-0 rounded-2xl shadow-xl"
                >
                  <div class="flex items-center justify-center h-full">
                    <i-ho-gift class="text-skin-heading text-sm" />
                  </div>
                </div>
                <div class="w-full">
                  <h5 class="leading-none">Rewards</h5>
                  <p class="leading-none">
                    You’re eligible to {{ eligibleBoosts.length }} boost<span
                      v-if="boosts.length > 1"
                      >s</span
                    >
                  </p>
                </div>
              </div>

              <div
                class="border text-border rounded-full py-1 px-[12px] justify-center flex md:mt-0 mt-3"
              >
                <div class="text-skin-link flex items-center opacity-40">
                  <i-ho-fire class="text-sm mr-2" />
                  <div class="whitespace-nowrap">
                    Claim
                    {{ relativeEndTime }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else-if="isActive"
          class="md:flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3">
            <div class="h-[46px] w-[46px] flex-shrink-0 rounded-2xl shadow-xl">
              <div class="flex items-center justify-center h-full">
                <i-s-boost-icon class="text-skin-heading" />
              </div>
            </div>
            <div class="w-full">
              <h4 class="leading-5">Boost proposal</h4>
              <p>Incentivize people to vote with rewards.</p>
            </div>
          </div>

          <TuneButton
            class="flex items-center justify-center w-full md:w-auto mt-3 md:mt-0"
            @click="handleBoost"
          >
            <i-ho-fire class="text-sm mr-2" />
            <div>Boost</div>
          </TuneButton>
        </div>
      </div>
    </TuneBlock>
    <SpaceProposalBoostModalCreate
      :open="createModalOpen"
      @close="createModalOpen = false"
      @start="handleStart"
    />
  </div>
</template>
