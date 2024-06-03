<script setup lang="ts">
import { formatUnits } from '@ethersproject/units';
import { Proposal } from '@/helpers/interfaces';
import { explorerUrl } from '@/helpers/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';
import {
  BoostClaimSubgraph,
  BoostRewardGuard,
  BoostSubgraph
} from '@/helpers/boost/types';

const props = defineProps<{
  proposal: Proposal;
  boost: BoostSubgraph;
  rewards: BoostRewardGuard[];
  claims: BoostClaimSubgraph[];
}>();

const emit = defineEmits(['reload']);

const { handleClaim, loadingClaim } = useBoost();
const { formatNumber, getNumberFormatter } = useIntl();

const reward = computed(() => {
  const reward = props.rewards.find(
    reward => reward.boost_id === props.boost.id
  ) as BoostRewardGuard;
  if (!reward) return '0';
  const amountDecimal = formatUnits(
    reward.reward.toString(),
    props.boost.token.decimals
  );

  return amountDecimal;
});

const claim = computed(() => {
  return props.claims.find(
    claim =>
      claim.boost.id === props.boost.id && claim.chainId === props.boost.chainId
  );
});

const hasClaimed = computed(() => {
  return claim.value !== undefined;
});

const boostNetworkInfo = computed(() => {
  return networks?.[props.boost.chainId];
});

async function handleClaimAndReload() {
  await handleClaim(props.boost, props.proposal.id);
  emit('reload');
}
</script>

<template>
  <div
    class="flex items-center justify-between border rounded-xl p-[12px]"
    :class="{
      'border-green/30 bg-green/5': hasClaimed,
      'border-boost/30 bg-boost/5': !hasClaimed && Number(reward) > 0
    }"
  >
    <div class="text-skin-heading flex items-center">
      <div
        class="border rounded-full p-[3px] mr-2 self-start"
        :class="{
          'border-green/40 bg-green/10': hasClaimed,
          'border-boost/40 bg-boost/10': !hasClaimed && Number(reward) > 0
        }"
      >
        <i-ho-cash v-if="hasClaimed" class="text-green text-xs" />
        <i-ho-gift v-else class="text-boost text-xs" />
      </div>

      <div>
        <span class="mr-1">
          {{ hasClaimed ? 'Claimed' : 'Reward' }}
        </span>
        <TuneTag class="text-skin-heading text-base">
          {{
            formatNumber(
              Number(reward),
              getNumberFormatter({ maximumFractionDigits: 8 }).value
            )
          }}
          {{ props.boost.token.symbol }}
        </TuneTag>
        <div class="mt-1 flex items-center flex-wrap">
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
      </div>
    </div>
    <div class="self-start mr-0">
      <TuneButton
        v-if="!hasClaimed && Number(reward) > 0"
        :loading="loadingClaim"
        class="h-[32px] px-[12px] bg-skin-bg"
        @click="handleClaimAndReload"
      >
        Claim
      </TuneButton>
      <BaseLink
        v-else-if="claim?.transactionHash"
        :link="explorerUrl(boost.chainId, claim.transactionHash, 'tx')"
        >View
      </BaseLink>
    </div>
  </div>
</template>
