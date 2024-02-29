<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';
import { withdrawAndBurn } from '@/helpers/boost';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { toChecksumAddress, explorerUrl } from '@/helpers/utils';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
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

const amountPerWinner = computed(() => {
  const isFinalAndLessVotes =
    Number(props.boost.strategy.distribution.numWinners) >
      Number(props.proposal.votes) && isFinal.value;

  const amountOfWinners = isFinalAndLessVotes
    ? Number(props.proposal.votes)
    : Number(props.boost.strategy.distribution.numWinners);

  const amount = Number(boostBalanceFormatted.value) / amountOfWinners;

  return `${formatNumber(
    Number(amount),
    getNumberFormatter({ maximumFractionDigits: 8 }).value
  )} ${props.boost.token.symbol}`;
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
  }
}
</script>

<template>
  <div>
    <div
      class="border border-[--border-color-soft] rounded-xl p-[12px] flex justify-between relative"
      :class="[
        {
          'border-boost/30 bg-boost/5': !hasClaimed
        },
        { 'border-green/30 bg-green/5': hasClaimed },
        { 'border-b-0 rounded-b-none': isOwner }
      ]"
    >
      <div class="w-full">
        <div class="text-skin-heading flex flex-wrap -mt-1 pr-5">
          <div class="whitespace-nowrap mt-1 mr-1 flex items-center">
            <template v-if="boost.strategy.eligibility.choice !== null">
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
                  content: `The pool of ${boostBalanceFormatted} ${boost.token.symbol} will be equally distributed among ${boost.strategy.distribution.numWinners} winners. Chances of winning are proportional to the amount of voting-power.`
                }"
                :label="amountPerWinner"
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
              <TuneTag :label="`${lotteryLimit}%`" class="text-skin-heading" />
            </div>
            <div v-else>
              reward of
              <TuneTag
                :label="`${weightedLimit} ${boost.token.symbol}`"
                class="text-skin-heading"
              />
            </div>
          </div>
        </div>
        <div class="mt-1 flex items-center">
          <span
            v-tippy="{
              content: 'Boost ID',
              delay: 100
            }"
          >
            #{{ boost.id }}
          </span>
          <BaseInterpunct />
          <div class="flex items-center gap-2">
            <BaseAvatar
              v-if="boostNetworkInfo?.logo"
              :src="getUrl(boostNetworkInfo.logo)"
              size="18"
            />

            <span class="text-skin-heading">
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
            v-else-if="!reward && isFinal"
            class="flex flex-wrap items-center justify-center gap-x-2"
          >
            <i-ho-emoji-sad class="text-sm" />
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
            class="flex items-center justify-center gap-2"
          >
            <i-ho-fire class="text-xs" />
            <span v-if="reward && isFinal">
              <span v-if="isLottery"> You won </span>
              <span v-else> Eligible to </span>
              {{ `${rewardFormatted} ${boost.token.symbol}` }}
              <button
                v-if="isLottery"
                type="button"
                class="ml-1 text-skin-link"
                @click="openWinnersModal = true"
              >
                View winners
              </button>
            </span>
            <span v-else>
              <span v-if="isLottery"> Eligible to win </span>
              <span v-else> Eligible to reward </span>
            </span>
          </div>
        </div>
      </div>
      <SpaceProposalBoostItemMenu
        :boost="boost"
        :claimed-transaction-hash="claimedTransactionHash"
        :lottery-and-final="isLottery && isFinal"
        @open-winners-modal="openWinnersModal = true"
      />
    </div>
    <div
      v-if="isOwner"
      class="border border-[--border-color-soft] bg-[--border-color-faint] p-[12px] rounded-b-xl"
      :class="[
        {
          'border-boost/30 bg-boost/5': !hasClaimed
        },
        { 'border-green/30 bg-green/5': hasClaimed }
      ]"
    >
      <div v-if="isOwner" class="text-skin-heading">Manage your boost</div>
      <div v-if="claimPeriodEnded" class="sm:flex justify-between items-center">
        <div class="leading-none">
          <div class="font-semibold text-skin-heading">Withdraw</div>
          <div>
            You have {{ withdrawalAmount }} {{ boost.token.symbol }} to withdraw
          </div>
        </div>

        <TuneButton
          v-if="Number(withdrawalAmount) > 0"
          class="h-5 px-[12px] text-skin-link bg-skin-bg w-full sm:w-auto mt-2 sm:mt-0"
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
              formatDuration(Number(boost.end) - Math.floor(Date.now() / 1000))
            }}
          </span>
        </div>
      </div>
    </div>
    <SpaceProposalBoostWinnersModal
      :open="openWinnersModal"
      :boost="boost"
      @close="openWinnersModal = false"
    />
  </div>
</template>
