<script setup lang="ts">
import { Proposal } from '@/helpers/interfaces';
import { getVouchers } from '@/helpers/boost/api';
import { formatUnits } from '@ethersproject/units';
import { claimAllTokens } from '@/helpers/boost';
import { getAddress } from '@ethersproject/address';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { BoostRewardGuard, BoostSubgraph } from '@/helpers/boost/types';

const props = defineProps<{
  proposal: Proposal;
  boosts: BoostSubgraph[];
  eligibleBoosts: BoostSubgraph[];
  hasUserClaimed: boolean;
  rewards: BoostRewardGuard[];
  loadingRewards: boolean;
}>();

const emit = defineEmits(['reload']);

const claimStatus = ref('');
const modalWrongNetworkOpen = ref(false);
const claimTx = ref();

const auth = getInstance();
const { web3Account, web3 } = useWeb3();
const { formatNumber, getNumberFormatter, formatDuration } = useIntl();

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

const firstEligibleBoost = computed(() => {
  if (!props.eligibleBoosts.length) return undefined;
  return props.eligibleBoosts[0];
});

const canClaimAll = computed(() => {
  if (!firstEligibleBoost.value) return false;
  const chainId = firstEligibleBoost.value.chainId;
  const tokenAddress = firstEligibleBoost.value.token.id;
  return props.eligibleBoosts.every(
    boost => boost.chainId === chainId && boost.token.id === tokenAddress
  );
});

const claimAllAmountFormatted = computed(() => {
  if (!canClaimAll.value) return 0;
  const units = props.rewards.reduce((total, reward) => {
    return total + Number(reward.reward);
  }, 0);

  const decimals = firstEligibleBoost.value!.token.decimals;
  const amountDecimal = formatUnits(units.toString(), decimals);

  return formatNumber(
    Number(amountDecimal),
    getNumberFormatter({ maximumFractionDigits: 6 }).value
  );
});

async function handleClaimAll() {
  if (props.loadingRewards || !props.rewards.length) return;
  if (
    firstEligibleBoost.value!.chainId !== web3.value.network.chainId.toString()
  ) {
    modalWrongNetworkOpen.value = true;
    return;
  }

  try {
    const vouchers = await loadVouchers();
    if (!vouchers?.length) throw new Error('No vouchers found');

    claimStatus.value = 'approve';

    const boosts = vouchers.map(voucher => ({
      boostId: voucher.boost_id,
      recipient: getAddress(web3Account.value),
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
  } catch (e: any) {
    console.error('Claim error:', e);
    if (e.message.includes('user rejected transaction')) {
      claimStatus.value = '';
    } else {
      claimStatus.value = 'error';
    }
  } finally {
    claimTx.value = undefined;
    emit('reload');
  }
}

async function loadVouchers() {
  const boosts = props.boosts.map(boost => [boost.id, boost.chainId]);
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
    console.log('Get vouchers error:', e);
  }
}
</script>

<template>
  <div>
    <TuneBlock
      v-if="!hasUserClaimed"
      slim
      class="bg-snapshot mx-4 md:mx-0 bg-[url('@/assets/images/stars-big-horizontal.png')] py-[32px] !border-0 mb-4"
    >
      <!-- TODO: Make sure to handle different tokens when claim -->
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
        <TuneButton variant="white" class="text-white" @click="handleClaimAll">
          <TuneLoadingSpinner v-if="loadingRewards" class="text-white" />
          <div v-else class="flex items-center">
            <i-ho-gift class="text-sm mr-2" />
            Claim
            <span v-if="canClaimAll" class="ml-[6px]">
              {{ claimAllAmountFormatted }}
              {{ firstEligibleBoost!.token.symbol }}
            </span>
            <span v-else class="ml-[6px]">
              {{ eligibleBoosts.length }} rewards
            </span>
          </div>
        </TuneButton>
      </div>
      <div
        v-if="firstEligibleBoost"
        class="flex text-white justify-center items-center mt-2"
      >
        <i-ho-clock class="mr-1 text-sm" />
        {{
          formatDuration(
            Number(firstEligibleBoost.end) - Number(firstEligibleBoost.start)
          )
        }}
        left
      </div>
    </TuneBlock>
    <ModalTransactionStatus
      v-if="claimStatusModalConfig"
      open
      :variant="claimStatusModalConfig.variant"
      :title="claimStatusModalConfig?.title"
      :subtitle="claimStatusModalConfig?.subtitle"
      :network="firstEligibleBoost?.chainId"
      @close="claimStatus = ''"
      @try-again="handleClaimAll"
    />
    <ModalWrongNetwork
      v-if="firstEligibleBoost && canClaimAll"
      :open="modalWrongNetworkOpen"
      :network="firstEligibleBoost.chainId"
      @network-changed="handleClaimAll"
      @close="modalWrongNetworkOpen = false"
    />
  </div>
</template>
