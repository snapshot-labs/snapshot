<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';
import { withdrawAndBurn } from '@/helpers/boost';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { getNormalizedAddress, explorerUrl } from '@/helpers/utils';
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

const isClaimedByUser = computed(() => {
  if (!props.claims?.length) return false;

  return props.claims.some(claim => claim.boost.id === props.boost.id);
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
  const claim = props.claims.find(claim => claim.boost.id === props.boost.id);

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
    getNormalizedAddress(props.boost.owner) ===
    getNormalizedAddress(web3Account.value)
  );
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
        { 'border-boost/40 bg-boost/5': isEligible && !isClaimedByUser },
        { 'border-green/30 bg-green/5': isClaimedByUser },
        { 'border-b-0 rounded-b-none !bg-[--border-color-faint]': isOwner }
      ]"
    >
      <div class="pr-5">
        <div class="text-skin-heading flex flex-wrap -mt-1">
          <div class="whitespace-nowrap mt-1 mr-1">
            <template v-if="boost.strategy.eligibility.choice !== null">
              Who votes
              <TuneTag
                :label="
                  proposal.choices[
                    Number(boost.strategy.eligibility.choice) - 1
                  ]
                "
                class="text-skin-heading"
              />
            </template>
            <template v-else> Voters </template>
          </div>
          <div class="whitespace-nowrap mt-1 mr-1">
            share a pool of
            <TuneTag
              :label="`${boostBalanceFormatted} ${boost.token.symbol}`"
              class="text-skin-heading"
            />
          </div>
          <div class="whitespace-nowrap mt-1">
            <template v-if="boost.strategy.distribution.type === 'weighted'">
              based on
              <TuneTag label="Voting power" class="text-skin-heading" />
            </template>
          </div>
        </div>
        <div class="mt-2 md:flex whitespace-nowrap flex-wrap">
          <div v-if="isOwner" class="flex items-center gap-1 mb-[2px]">
            <i-s-crown class="text-xs" />
            Your boost
          </div>
          <span v-if="isOwner" class="hidden md:block px-2 text-lg leading-none"
            >·</span
          >
          <div class="flex items-center gap-1 mb-[2px]">
            <i-ho-lock-closed class="text-xs" />
            Secured by Snapshot
          </div>
          <span
            v-if="claimedTransactionHash || isEligible"
            class="hidden md:block px-2 text-lg leading-none"
            >·</span
          >
          <BaseLink
            v-if="claimedTransactionHash"
            hide-external-icon
            :link="explorerUrl(boost.chainId, claimedTransactionHash, 'tx')"
            class="flex items-center gap-1 text-skin-text hover:text-skin-link"
          >
            <i-ho-cash class="text-xs" />
            Claimed {{ claimedAmount }} {{ boost.token.symbol }}
          </BaseLink>
          <div v-else-if="isEligible" class="flex items-center gap-1">
            <i-ho-fire class="text-xs" />
            Eligible to
            {{ reward ? `${rewardFormatted} ${boost.token.symbol}` : 'reward' }}
          </div>
        </div>
      </div>
      <SpaceProposalBoostItemMenu
        :boost="boost"
        :claimed-transaction-hash="claimedTransactionHash"
      />
    </div>
    <div
      v-if="isOwner"
      class="border border-[--border-color-soft] bg-[--border-color-faint] p-[12px] rounded-b-xl"
      :class="[
        {
          'border-boost/40 bg-boost/5': isEligible && !isClaimedByUser
        },
        { 'border-green/30 bg-green/5': isClaimedByUser }
      ]"
    >
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
      <div v-else class="md:flex">
        <div>
          Remaining amount:
          <span class="text-skin-heading">
            {{ withdrawalAmount }} {{ boost.token.symbol }}
          </span>
        </div>
        <span class="hidden md:block px-2 text-lg leading-none">·</span>
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
  </div>
</template>