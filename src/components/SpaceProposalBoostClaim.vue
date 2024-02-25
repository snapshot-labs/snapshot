<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { getVouchers } from '@/helpers/boost/api';
import { claimAllTokens, claimTokens } from '@/helpers/boost';
import { toChecksumAddress } from '@/helpers/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import {
  BoostRewardGuard,
  BoostSubgraph,
  BoostClaimSubgraph
} from '@/helpers/boost/types';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  proposal: Proposal;
  boosts: BoostSubgraph[];
  eligibleBoosts: BoostSubgraph[];
  rewards: BoostRewardGuard[];
  claims: BoostClaimSubgraph[];
  loadingRewards: boolean;
}>();

const emit = defineEmits(['reload']);

const claimStatus = ref('');
const claimTx = ref();
const claimModalOpen = ref(false);
const loadingClaim = ref();

const auth = getInstance();
const { web3Account, web3 } = useWeb3();
const { formatDuration } = useIntl();
const { changeNetwork } = useChangeNetwork();

const claimStatusModalConfig = computed(() => {
  switch (claimStatus.value) {
    case 'approve':
      return {
        title: 'Confirm claim',
        subtitle: 'Please confirm transaction on your wallet.',
        variant: 'loading' as const
      };
    case 'pending':
      return {
        title: 'Transaction pending',
        subtitle: claimTx.value?.hash || '',
        variant: 'loading' as const
      };
    case 'success':
      return {
        title: 'Well done! 🥳',
        subtitle: 'Your reward has been claimed.',
        variant: 'success' as const
      };
    case 'error':
      return {
        title: 'Transaction failed',
        subtitle: claimTx.value?.hash || 'Oops... Your claim failed!',
        variant: 'error' as const
      };
    default:
      return undefined;
  }
});

const unclaimedBoostsWithReward = computed(() => {
  if (!props.rewards.length) return [];
  return props.eligibleBoosts
    .filter(boost => {
      const hasClaimed = props.claims.some(
        claim => claim.boost.id === boost.id && claim.chainId === boost.chainId
      );
      return !hasClaimed;
    })
    .filter(boost => {
      const reward = props.rewards.find(reward => reward.boost_id === boost.id);
      return Number(reward?.reward) > 0;
    });
});

async function handleClaimAll() {
  if (props.rewards[0].chain_id !== web3.value.network.chainId.toString()) {
    return await changeNetwork(props.rewards[0].chain_id);
  }

  try {
    claimStatus.value = 'loading';
    const vouchers = await loadVouchers(unclaimedBoostsWithReward.value);
    if (!vouchers?.length) throw new Error('No vouchers found');

    claimModalOpen.value = false;
    await sleep(300);
    claimStatus.value = 'approve';

    const boosts = vouchers.map(voucher => ({
      boostId: voucher.boost_id,
      recipient: toChecksumAddress(web3Account.value),
      amount: voucher.reward
    }));
    const signatures = vouchers.map(voucher => voucher.signature);
    const chainId = vouchers[0].chain_id;
    claimTx.value = await claimAllTokens(
      auth.web3,
      chainId,
      boosts,
      signatures
    );

    claimStatus.value = 'pending';

    await claimTx.value.wait();
    claimStatus.value = 'success';
    emit('reload');
  } catch (e: any) {
    console.error('Claim error:', e);
    if (e.message.includes('user rejected transaction')) {
      claimStatus.value = '';
    } else {
      claimStatus.value = 'error';
    }
  } finally {
    claimTx.value = undefined;
  }
}

async function handleClaim(boost: BoostSubgraph) {
  if (boost.chainId !== web3.value.network.chainId.toString()) {
    return await changeNetwork(boost.chainId);
  }

  try {
    loadingClaim.value = {
      [boost.id]: boost.chainId
    };
    const response = await loadVouchers([boost]);
    if (!response) throw new Error('Failed to get vouchers');

    const voucher = response[0];
    const signature = voucher.signature;
    const chainId = voucher.chain_id;
    claimTx.value = await claimTokens(
      auth.web3,
      chainId,
      {
        boostId: voucher.boost_id,
        recipient: toChecksumAddress(web3Account.value),
        amount: voucher.reward
      },
      signature
    );

    await claimTx.value.wait();
    emit('reload');
  } catch (e: any) {
    console.error('Claim error:', e);
  } finally {
    loadingClaim.value = undefined;
  }
}

async function loadVouchers(boosts: BoostSubgraph[]) {
  try {
    const vouchers = await getVouchers(
      props.proposal.id,
      web3Account.value,
      boosts
    );

    console.log(
      '🚀 ~ file: SpaceProposalBoost.vue:153 ~ loadVouchers ~ vouchers:',
      vouchers
    );
    return vouchers;
  } catch (e) {
    console.error('Get vouchers error:', e);
  }
}

const timeLeftToClaim = computed(() => {
  if (!unclaimedBoostsWithReward.value.length) return 0;
  return (
    Number(unclaimedBoostsWithReward.value[0].end) -
    Math.floor(Date.now() / 1000)
  );
});
</script>

<template>
  <div>
    <TuneBlock
      v-if="unclaimedBoostsWithReward.length"
      slim
      class="!bg-boost bg-[url('@/assets/images/stars-big-horizontal.svg')] py-[32px] !border-0 mb-[20px] lg:mb-4"
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
              {{ unclaimedBoostsWithReward.length }}
            </span>
          </div>
        </div>
        <div class="text-white text-md text-center leading-5 mt-3">
          <div class="font-semibold mb-1">Claim rewards</div>
          You can now claim your rewards!
        </div>
      </div>

      <div class="flex justify-center mt-3">
        <TuneButton
          variant="white"
          class="text-white"
          :class="{
            'cursor-not-allowed': loadingRewards || timeLeftToClaim <= 0
          }"
          @click="
            !loadingRewards && timeLeftToClaim > 0 && (claimModalOpen = true)
          "
        >
          <TuneLoadingSpinner v-if="loadingRewards" class="text-white" />
          <div v-else class="flex items-center">
            <i-ho-gift class="text-sm mr-2" />
            Claim
            <span class="ml-[4px]">
              {{ unclaimedBoostsWithReward.length }} reward<span
                v-if="unclaimedBoostsWithReward.length > 1"
                >s</span
              >
            </span>
          </div>
        </TuneButton>
      </div>
      <div class="flex text-white justify-center mt-2">
        <span v-if="timeLeftToClaim > 0" class="flex items-center">
          <i-ho-clock class="mr-1 text-sm" />
          {{ formatDuration(timeLeftToClaim) }}
          left
        </span>
        <span v-else class="flex items-center">
          <i-ho-exclamation-circle class="mr-1 text-sm" />
          Claiming period ended
        </span>
      </div>
    </TuneBlock>
    <ModalTransactionStatus
      v-if="claimStatusModalConfig && claimStatus !== 'success'"
      open
      :variant="claimStatusModalConfig.variant"
      :title="claimStatusModalConfig?.title"
      :subtitle="claimStatusModalConfig?.subtitle"
      :network="rewards[0].chain_id"
      @close="claimStatus = ''"
      @try-again="handleClaimAll"
    />
    <SpaceProposalBoostClaimModalSuccess
      :open="claimStatus === 'success'"
      @close="claimStatus = ''"
    />
    <SpaceProposalBoostClaimModal
      :open="claimModalOpen"
      :boosts="eligibleBoosts"
      :claimable-boosts="unclaimedBoostsWithReward"
      :claims="claims"
      :rewards="rewards"
      :loading-claim-all="claimStatus === 'loading'"
      :loading-claim="loadingClaim"
      @close="claimModalOpen = false"
      @claim-all="handleClaimAll"
      @claim="handleClaim"
    />
  </div>
</template>
