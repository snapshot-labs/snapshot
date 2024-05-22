<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { withdrawAndBurn } from '@/helpers/boost';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { toChecksumAddress, explorerUrl } from '@/helpers/utils';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getWinners } from '@/helpers/boost/api';
import { useIntervalFn } from '@vueuse/core';
import {
  BoostClaimSubgraph,
  BoostRewardGuard,
  BoostSubgraph
} from '@/helpers/boost/types';

const props = defineProps<{
  proposal: Proposal;
  boost: BoostSubgraph;
  claims?: BoostClaimSubgraph[];
  isEligible?: boolean;
  reward?: BoostRewardGuard;
}>();

const emit = defineEmits(['reload']);

const auth = getInstance();
const { web3Account } = useWeb3();
const { formatNumber, getNumberFormatter, formatDuration } = useIntl();

const openWinnersModal = ref(false);
const lotteryWinners = ref<string[]>([]);
const lotteryPrize = ref('0');
const lotteryEpochNotFinalized = ref(false);
const loadingWithdraw = ref(false);
const loadingWinners = ref(false);
const minutesUntilEpochEnd = ref(0);
const winnersError = ref(false);

const boostBalanceFormatted = computed(() => {
  const formattedUnits = formatUnits(
    props.boost.poolSize,
    props.boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const isFinal = computed(() => {
  return props.proposal.scores_state === 'final';
});

const hasClaimed = computed(() => {
  if (!props.claims?.length) return false;

  return props.claims.some(
    claim =>
      claim.boost.id === props.boost.id && claim.chainId === props.boost.chainId
  );
});

const claimedAmount = computed(() => {
  if (!props.claims?.length) return '0';
  const claim = props.claims.find(claim => claim.boost.id === props.boost.id);

  if (!claim) return '0';

  const formattedUnits = formatUnits(claim.amount, props.boost.token.decimals);

  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const claimedTransactionHash = computed(() => {
  if (!props.claims?.length) return undefined;
  const claim = props.claims.find(
    claim =>
      claim.boost.id === props.boost.id && claim.chainId === props.boost.chainId
  );

  if (!claim) return undefined;

  return claim.transactionHash;
});

const rewardFormatted = computed(() => {
  if (!props.reward) return '0';
  const formattedUnits = formatUnits(
    props.reward.reward,
    props.boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const withdrawalAmount = computed(() => {
  const formattedUnits = formatUnits(
    props.boost.currentBalance,
    props.boost.token.decimals
  );
  return formatNumber(
    Number(formattedUnits),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const claimPeriodEnded = computed(() => {
  return Number(props.boost.end) < Date.now() / 1000;
});

const isOwner = computed(() => {
  return (
    toChecksumAddress(props.boost.owner) ===
    toChecksumAddress(web3Account.value)
  );
});

const isLottery = computed(() => {
  return props.boost.strategy.distribution.type === 'lottery';
});

const amountPerWinner = computed(() => {
  if (!isLottery.value) return;
  const amount = BigNumber.from(props.boost.poolSize).div(
    BigNumber.from(props.boost.strategy.distribution.numWinners)
  );

  return formatNumber(
    Number(formatUnits(amount, props.boost.token.decimals)),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  );
});

const lotteryNoRewardFinal = computed(() => {
  return isLottery.value && !props.reward && isFinal.value;
});

const lotteryLimit = computed(() => {
  if (!isLottery || !props.boost.strategy.distribution.limit) return 0;
  return Number(props.boost.strategy.distribution.limit) / 100;
});

const weightedLimit = computed(() => {
  if (isLottery.value || !props.boost.strategy.distribution.limit) return 0;
  return formatUnits(
    props.boost.strategy.distribution.limit,
    props.boost.token.decimals
  );
});

const boostNetworkInfo = computed(() => {
  return networks?.[props.boost.chainId];
});

async function withdraw(boost: BoostSubgraph) {
  try {
    loadingWithdraw.value = true;
    const tx = await withdrawAndBurn(
      auth.web3,
      boost.chainId,
      boost.id,
      web3Account.value
    );
    await tx.wait();
    emit('reload');
  } catch (e) {
    console.error('Error withdrawing boost', e);
  } finally {
    loadingWithdraw.value = false;
  }
}

async function loadWinners() {
  if (!isFinal.value || !isLottery.value) return;
  loadingWinners.value = true;
  winnersError.value = false;
  lotteryEpochNotFinalized.value = false;

  try {
    const response = await getWinners(
      props.boost.strategy.proposal,
      props.boost.id,
      props.boost.chainId
    );

    lotteryWinners.value = response.winners;
    lotteryPrize.value = response.prize;
  } catch (e: any) {
    console.error('Error loading winners', e);
    if (
      e.message === 'epoch is not finalized' ||
      e.message === 'failed to parse epoch'
    ) {
      lotteryEpochNotFinalized.value = true;
    } else {
      winnersError.value = true;
    }
  } finally {
    loadingWinners.value = false;
  }
}

watch(
  isFinal,
  async () => {
    loadWinners();
  },
  { immediate: true }
);

const { pause } = useIntervalFn(() => {
  if (!isFinal.value) return;
  const proposalEnd = Number(props.proposal.end);
  const twentyMinutes = 20 * 60;
  minutesUntilEpochEnd.value = Math.floor(
    (proposalEnd + twentyMinutes - Date.now() / 1000) / 60
  );

  if (minutesUntilEpochEnd.value <= 2) pause();
}, 1000);
</script>

<template>
  <div>
    <div
      class="border border-[--border-color-soft] rounded-xl p-[12px]"
      :class="[
        {
          'border-boost/30 bg-boost/5': !hasClaimed && isEligible
        },
        { 'border-green/30 bg-green/5': hasClaimed }
      ]"
    >
      <div class="flex justify-between relative">
        <div class="w-full">
          <div class="text-skin-heading flex flex-wrap -mt-1 pr-5">
            <div class="whitespace-nowrap mt-1 mr-1 flex items-center">
              <template v-if="boost.strategy.eligibility.type === 'prediction'">
                Anyone who votes for the winning choice
              </template>
              <template v-else-if="boost.strategy.eligibility.choice !== null">
                Who votes
                <div>
                  <TuneTag
                    :label="
                      proposal.choices[
                        Number(boost.strategy.eligibility.choice) - 1
                      ]
                    "
                    class="text-skin-heading ml-1"
                  />
                </div>
              </template>
              <template v-else> Anyone who votes </template>
            </div>
            <div
              v-if="boost.strategy.distribution.type === 'weighted'"
              class="whitespace-nowrap mt-1 mr-1 flex items-center"
            >
              shares a pool of
              <div>
                <TuneTag
                  :label="`${boostBalanceFormatted} ${boost.token.symbol}`"
                  class="text-skin-heading ml-1"
                />
              </div>
            </div>
            <div v-else-if="isLottery" class="mt-1 mr-1 flex items-center">
              can win
              <div>
                <TuneTag
                  v-tippy="{
                    content: `The pool of ${boostBalanceFormatted} ${boost.token.symbol} will be equally distributed among ${boost.strategy.distribution.numWinners} winners. Chances of winning are proportional to the amount of voting-power. If the maximum amount of winners is not reached, the reward will be increased equally.`
                  }"
                  :label="`${amountPerWinner} ${props.boost.token.symbol}`"
                  class="text-skin-heading ml-1 cursor-help"
                />
              </div>
            </div>
            <div class="whitespace-nowrap mt-1 mr-1 flex items-center">
              <span v-if="isLottery" class="mr-1"> chances </span>
              based on
              <div>
                <TuneTag label="Voting power" class="text-skin-heading ml-1" />
              </div>
            </div>
            <div
              v-if="boost.strategy.distribution.limit"
              class="flex items-center gap-1 mt-1 whitespace-nowrap"
            >
              with a max
              <div v-if="isLottery">
                chance of
                <TuneTag
                  v-tippy="{
                    content:
                      'If there are not enough voters, this limit will not be enforced and the chance to win will be increased proportionally to voting power.',
                    delay: 100
                  }"
                  :label="`${lotteryLimit}%`"
                  class="text-skin-heading cursor-help"
                />
              </div>
              <div v-else>
                reward of
                <TuneTag
                  v-tippy="{
                    content:
                      'The maximum amount of tokens that can be distributed to each voter. If the pool is larger than the total reward for eligible voters, the reward will increase proportionally.'
                  }"
                  :label="`${weightedLimit} ${boost.token.symbol}`"
                  class="text-skin-heading cursor-help"
                />
              </div>
            </div>
          </div>
          <div class="mt-1 flex items-center">
            <span
              v-tippy="{
                content:
                  'Boost ID is a unique identifier for this boost on the given network.',
                delay: 100
              }"
            >
              Boost #{{ boost.id }}
            </span>
            <BaseInterpunct />
            <div class="flex items-center gap-2">
              <BaseAvatar
                v-if="boostNetworkInfo?.logo"
                :src="getUrl(boostNetworkInfo.logo)"
                size="18"
              />

              <span>
                {{ boostNetworkInfo?.name }}
              </span>
            </div>
          </div>
          <div
            v-if="claimedTransactionHash || isEligible"
            class="border w-full bg-[--border-color-faint] px-[12px] py-2 rounded-xl mt-[12px]"
            :class="[
              {
                'border-boost/30 bg-boost/5 text-boost':
                  isEligible && !hasClaimed && !lotteryNoRewardFinal,
                'border-green/30 bg-green/5 text-green': hasClaimed
              }
            ]"
          >
            <BaseLink
              v-if="claimedTransactionHash"
              :link="explorerUrl(boost.chainId, claimedTransactionHash, 'tx')"
              class="flex items-center gap-1 text-green hover:text-skin-link justify-center"
            >
              <i-ho-cash class="text-xs" />
              Claimed {{ claimedAmount }} {{ boost.token.symbol }}
            </BaseLink>
            <div
              v-else-if="loadingWinners"
              class="text-skin-heading flex justify-center h-[24px]"
            >
              <TuneLoadingSpinner />
            </div>
            <div
              v-else-if="isFinal && lotteryEpochNotFinalized"
              class="text-center"
            >
              Finalizing winners. Please check back
              <span v-if="minutesUntilEpochEnd > 2">
                in {{ minutesUntilEpochEnd }} minutes!
              </span>
              <span v-else> shortly!</span>
            </div>
            <div v-else-if="winnersError" class="text-center">
              Something went wrong. Please try again later.
            </div>
            <div
              v-else-if="!reward && isFinal && isLottery"
              class="flex flex-wrap items-center justify-center gap-x-1"
            >
              <i-ho-emoji-sad class="text-xs" />
              Oops, you didn't win this time!
              <button
                type="button"
                class="text-skin-link"
                @click="openWinnersModal = true"
              >
                View winners
              </button>
            </div>
            <div
              v-else-if="isEligible"
              class="flex flex-wrap items-center justify-center gap-x-1"
            >
              <i-ho-fire class="text-xs" />
              <template v-if="reward && isFinal">
                Reward
                {{ `${rewardFormatted} ${boost.token.symbol}` }}
                <button
                  v-if="isLottery"
                  type="button"
                  class="ml-1 text-skin-link"
                  @click="openWinnersModal = true"
                >
                  View winners
                </button>
              </template>
              <template v-else> You are eligible </template>
            </div>
          </div>
          <BaseMessage
            v-if="
              isLottery &&
              Number(rewardFormatted) > 0 &&
              Number(amountPerWinner) < Number(rewardFormatted)
            "
            level="info"
            class="border bg-[--border-color-subtle] p-3 rounded-xl text-skin-text mt-2"
          >
            The reward increased due to not enough eligible voters to hit the
            {{ boost.strategy.distribution.numWinners }} winner cap for this
            boost.
          </BaseMessage>
        </div>
        <SpaceProposalBoostItemMenu
          :boost="boost"
          :claimed-transaction-hash="claimedTransactionHash"
          :show-winners="
            !lotteryEpochNotFinalized && isLottery && !winnersError && isFinal
          "
          @open-winners-modal="openWinnersModal = true"
        />
      </div>
      <div
        v-if="isOwner"
        class="border-t border-[--border-color-soft] bg-[--border-color-faint] p-[12px] rounded-b-xl -mx-[12px] -mb-[12px] mt-[12px]"
        :class="[
          {
            'border-boost/20 bg-boost/5': !hasClaimed && isEligible
          },
          { 'border-green/20 bg-green/5': hasClaimed }
        ]"
      >
        <div v-if="isOwner && !claimPeriodEnded" class="text-skin-heading">
          About your boost
        </div>
        <div
          v-if="claimPeriodEnded"
          class="sm:flex justify-between items-center"
        >
          <div class="leading-none">
            <div class="font-semibold text-skin-heading flex items-center">
              Withdraw
              <i-ho-information-circle
                v-tippy="{
                  content:
                    'You can withdraw your remaining unclaimed tokens and burn the boost NFT or you give voters more time to claim their rewards and withdraw your remaining tokens later.'
                }"
                class="text-xs ml-1 text-skin-text"
              />
            </div>
            <div>
              You have {{ withdrawalAmount }} {{ boost.token.symbol }} to
              withdraw
            </div>
          </div>

          <TuneButton
            v-if="Number(withdrawalAmount) > 0"
            class="h-5 px-[12px] text-skin-link bg-skin-bg w-full sm:w-auto mt-2 sm:mt-0"
            :loading="loadingWithdraw"
            @click="withdraw(boost)"
          >
            Withdraw {{ withdrawalAmount }} {{ boost.token.symbol }}
          </TuneButton>
        </div>
        <div v-else class="md:flex items-center">
          <div>
            Amount remaining:
            <span class="text-skin-heading">
              {{ withdrawalAmount }} {{ boost.token.symbol }}
            </span>
          </div>
          <BaseInterpunct class="hidden md:block" />
          <div class="mt-[2px] md:mt-0">
            Withdrawable in:
            <span class="text-skin-heading">
              {{
                formatDuration(
                  Number(boost.end) - Math.floor(Date.now() / 1000)
                )
              }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <SpaceProposalBoostWinnersModal
      :open="openWinnersModal"
      :boost="boost"
      :winners="lotteryWinners"
      :prize="lotteryPrize"
      @close="openWinnersModal = false"
    />
  </div>
</template>
