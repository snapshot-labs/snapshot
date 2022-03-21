<script setup>
import { ref, onMounted } from 'vue';
import { usePlugins } from '@/composables/usePlugins';
import { useTxStatus } from '@/composables/useTxStatus';
import { useWeb3 } from '@/composables/useWeb3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { formatEther } from '@ethersproject/units';
import ABI from './abi.json'

const { web3Account } = useWeb3();

const props = defineProps({
  proposal: Object,
  space: Object
});

const rewardsContract = '0x4362f5B244f1f846df58C567A5704C34c5CA9BbB';
const nullAddress = '0x0000000000000000000000000000000000000000';
const nullWhitelist = '0x0000000000000000000000000000000000000000000000000000000000000000';

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
  getDeposits();
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
  getDeposits();
}

async function postWhitelist() {
  const { root, signature } = await fetch(
    `${import.meta.env.VITE_HUB_URL}/api/merkle/${props.proposal.id}`
  ).then(res => res.json());

  const tx = await sendTransaction(
    getInstance().web3,
    rewardsContract,
    ABI,
    'setMerkleRootForProposal',
    [props.proposal.id, root, signature]
  );
  pendingCount.value++;
  await tx.wait();
  pendingCount.value--;
  getWhitelist();
}

async function claim() {
  const tx = await sendTransaction(
    getInstance().web3,
    rewardsContract,
    ABI,
    'claim',
    [
      props.proposal.id,
      web3Account.value,
      '1000000000000000',
      nullAddress,
      []
    ]
  );
  pendingCount.value++;
  await tx.wait();
  pendingCount.value--;
}

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
        {{ formatEther(Number(currentDeposits)) }}
        {{ space.plugins.boost.token ? 'ERC' : 'ETH' }}
      </div>
    </div>
    <div v-if="proposal.state === 'active'">
      <UiInput v-model="amount" number />
      <BaseButton
        class="w-full mt-2"
        @click="depositETH"
        primary
      >
        {{ $t('boost.deposit') }}
      </BaseButton>
    </div>
    <div v-else>
      <BaseButton
        v-if="whitelist === nullWhitelist"
        class="w-full mt-2"
        @click="postWhitelist"
        primary
      >
        {{ $t('boost.postWhitelist') }}
      </BaseButton>
      <BaseButton
        v-else
        class="w-full mt-2"
        @click="claim"
        primary
      >
        {{ $t('boost.claim') }}
      </BaseButton>
    </div>
  </BaseBlock>
</template>
