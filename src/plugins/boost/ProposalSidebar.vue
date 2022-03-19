<script setup>
import { ref, onMounted } from 'vue';
import { usePlugins } from '@/composables/usePlugins';
import { useTxStatus } from '@/composables/useTxStatus';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import ABI from './abi.json'

const props = defineProps({
  proposal: Object,
  space: Object
});

const rewardsContract = '0xda30f61Fbe1A2829395e006325a6b1Bd2bfFCAd9';
const nullAddress = '0x0000000000000000000000000000000000000000';

const { pluginIndex } = usePlugins();
const { pendingCount } = useTxStatus();

const amount = ref(0);
const currentDeposits = ref(0);
const whitelist = ref(null);

async function getDeposits() {
  currentDeposits.value = await sendTransaction(
    getInstance().web3,
    rewardsContract,
    ABI,
    'getDeposits',
    [props.proposal.id, props.space.plugins.boost.token || nullAddress]
  );
}

async function getWhitelist() {
  whitelist.value = await sendTransaction(
    getInstance().web3,
    rewardsContract,
    ABI,
    'getWhitelist',
    [props.proposal.id]
  );
}

async function depositETH() {
  const tx = await sendTransaction(
    getInstance().web3,
    rewardsContract,
    ABI,
    'depositETH',
    [props.proposal.id],
    { value: amount.value }
  );
  pendingCount.value++;
  await tx.wait();
  pendingCount.value--;
}

async function depositERC() {
  const tx = await sendTransaction(
    getInstance().web3,
    rewardsContract,
    ABI,
    'depositERC',
    [props.proposal.id, space.plugins.boost.token, amount.value]
  );
  pendingCount.value++;
  await tx.wait();
  pendingCount.value--;
}

async function claim() {}

onMounted(() => {
  getDeposits();
  getWhitelist();
});
</script>

<template>
  <BaseBlock
    v-if="space.plugins.boost"
    :title="pluginIndex.boost.name"
  >
    <div class="mb-3 text-center">
      Rewards pool:
      <div class="font-bold text-lg text-skin-link">
        {{ Number(currentDeposits) }}
        {{ space.plugins.boost.token ? 'ERC' : 'ETH' }}
      </div>
    </div>
    <div v-if="proposal.state === 'active'">
      <UiInput v-model="amount" number />
      <BaseButton
        class="w-full mt-2"
        @click="space.plugins.boost.token ? depositERC : depositETH"
        primary
      >
        {{ $t('boost.deposit') }}
      </BaseButton>
    </div>
    <div v-else>
      <BaseButton
        class="w-full mt-2"
        @click="claim"
        primary
      >
        {{ $t('boost.claim') }}
      </BaseButton>
    </div>
  </BaseBlock>
</template>
