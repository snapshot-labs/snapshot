<script setup lang="ts">
import { Proposal, BoostSubgraphResult } from '@/helpers/interfaces';
import { getRewards, getVouchers, Reward, Voucher } from '@/helpers/boost/api';
import { formatUnits } from '@ethersproject/units';
import { claimAllTokens } from '@/helpers/boost';
import { getAddress } from '@ethersproject/address';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';

const props = defineProps<{
  proposal: Proposal;
  boosts: BoostSubgraphResult[];
  eligibleBoosts: BoostSubgraphResult[];
}>();

const boostRewards = ref<Reward[]>([]);
const boostVouchers = ref<Voucher[]>([]);
const claimStatus = ref('');
const modalWrongNetworkOpen = ref(false);
const loadingRewards = ref(false);

const auth = getInstance();
const { web3Account, web3 } = useWeb3();
const { formatNumber, getNumberFormatter } = useIntl();

const claimStatusModalConfig = computed(() => {
  switch (claimStatus.value) {
    case 'claiming':
      return {
        title: 'Confirm claim',
        subtitle: 'Please confirm transaction on your wallet.',
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
        subtitle: 'Oops... Your claim failed!',
        variant: 'error' as const
      };
    default:
      return undefined;
  }
});

const firstEligibleBoost = computed(() => {
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

const claimAllAmountUnits = computed(() => {
  if (!canClaimAll.value) return 0;
  return boostRewards.value.reduce((total, reward) => {
    return total + Number(reward.reward);
  }, 0);
});

const claimAllAmountFormatted = computed(() => {
  if (!canClaimAll.value) return 0;
  const decimals = firstEligibleBoost.value.token.decimals;
  const amount = formatUnits(claimAllAmountUnits.value.toString(), decimals);
  return formatNumber(
    Number(amount),
    getNumberFormatter({ maximumFractionDigits: 6 }).value
  );
});

async function handleClaimAll() {
  if (loadingRewards.value) return;
  if (
    firstEligibleBoost.value.chainId !== web3.value.network.chainId.toString()
  ) {
    modalWrongNetworkOpen.value = true;
    return;
  }
  await loadVouchers();

  try {
    claimStatus.value = 'claiming';
    const boosts = boostVouchers.value.map(voucher => ({
      boostId: voucher.boost_id,
      recipient: getAddress(web3Account.value),
      amount: voucher.reward
    }));
    const signatures = boostVouchers.value.map(voucher => voucher.signature);
    const chainId = boostVouchers.value[0].chain_id;
    await claimAllTokens(auth.web3, chainId, boosts, signatures);
    claimStatus.value = 'success';
  } catch (e: any) {
    console.error('Claim error:', e);
    if (e.message.includes('user rejected transaction')) {
      claimStatus.value = '';
    } else {
      claimStatus.value = 'error';
    }
  }
}

async function loadVouchers() {
  const boosts = props.boosts.map(boost => [boost.id, boost.chainId]);
  try {
    boostVouchers.value = await getVouchers(
      props.proposal.id,
      web3Account.value,
      boosts
    );
  } catch (e) {
    boostVouchers.value = [];
    console.log('Get vouchers error:', e);
  }
  // boostVouchers.value[0].reward = '10000000000000000';
  // TODO: Fix reward
  console.log(
    '🚀 ~ file: SpaceProposalBoost.vue:153 ~ loadVouchers ~ vouchers:',
    boostVouchers.value
  );
}

async function loadRewards() {
  if (!web3Account.value) return;
  loadingRewards.value = true;

  const boosts = props.boosts.map(boost => [boost.id, boost.chainId]);
  try {
    boostRewards.value = await getRewards(
      props.proposal.id,
      web3Account.value,
      boosts
    );
    // boostRewards.value[0].reward = '10000000000000000';
    // TODO: Fix reward
  } catch (e) {
    boostRewards.value = [];
    console.log('Get rewards error:', e);
  } finally {
    loadingRewards.value = false;
  }

  console.log(
    '🚀 ~ file: SpaceProposalBoost.vue:153 ~ loadRewards ~ rewards:',
    boostRewards.value
  );
}

watch(
  web3Account,
  () => {
    loadRewards();
  },
  { immediate: true }
);
</script>

<template>
  <TuneBlock
    slim
    class="bg-snapshot bg-[url('@/assets/images/stars-big-horizontal.png')] h-[250px] py-[32px] !border-0"
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
      <TuneButton variant="white" class="text-white" @click="handleClaimAll">
        <TuneLoadingSpinner v-if="loadingRewards" class="text-white" />
        <div v-else class="flex items-center">
          <i-ho-gift class="text-sm mr-2" />
          Claim
          <span v-if="canClaimAll" class="ml-[6px]">
            {{ claimAllAmountFormatted }}
            {{ firstEligibleBoost.token.symbol }}
          </span>
          <span v-else class="ml-[6px]">
            {{ eligibleBoosts.length }} rewards
          </span>
        </div>
      </TuneButton>
    </div>
    <ModalTransactionStatus
      v-if="claimStatusModalConfig"
      open
      :variant="claimStatusModalConfig.variant"
      :title="claimStatusModalConfig?.title"
      :subtitle="claimStatusModalConfig?.subtitle"
      @close="claimStatus = ''"
    />
    <ModalWrongNetwork
      v-if="firstEligibleBoost && canClaimAll"
      :open="modalWrongNetworkOpen"
      :network="firstEligibleBoost.chainId"
      @network-changed="handleClaimAll"
      @close="modalWrongNetworkOpen = false"
    />
  </TuneBlock>
</template>
