<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { formatBytes32String } from '@ethersproject/strings';

const props = defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
  open: boolean;
}>();

defineEmits(['close']);

const auth = getInstance();
const { notify } = useFlashNotification();
const {
  createPendingTransaction,
  updatePendingTransaction,
  removePendingTransaction
} = useTxStatus();
const { validEnsTlds } = useEns();
const { t } = useI18n();
const { web3 } = useWeb3();

// watch(
//   () => props.open,
//   val => {
//   }
// );

const abi = [
  'function mint(uint256 proposalId, uint256 salt, uint8 v, bytes32 r, bytes32 s)'
];

const loading = ref(false);
const mintCurrency = 'MATIC';
const minMintPrice = ref('0.001');

async function mint() {
  // sign message
  // fetch BE with spaceId, proposalId, salt?
  // check, approve, WETH flow
  // TODO move to mint coposable
  const txPendingId = createPendingTransaction();
  loading.value = true;
  try {
    const tx = await sendTransaction(
      auth.web3,
      '0xdDEd2972fB62907723463322b2C709CC9F5466C2',
      abi,
      'mint',
      [
        props.proposal.id,
        0,
        1,
        formatBytes32String('2'),
        formatBytes32String('3')
      ]
    );
    console.log(':mint tx', tx);
    notify(t('notify.transactionSent'));
    updatePendingTransaction(txPendingId, { hash: tx.hash });
    loading.value = false;
    const receipt = await tx.wait();
    console.log('Receipt', receipt);
    // await sleep(3e3);
    // notify(t('notify.delegationSuccess'));
  } catch (e) {
    notify(['red', t('notify.somethingWentWrong')]);
    console.log(e);
  } finally {
    loading.value = false;
    removePendingTransaction(txPendingId);
  }
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>{{ $t('Mint NFT') }}</h3>
      </div>
    </template>
    <template #default="{ maxHeight }">
      <div
        class="flex flex-row justify-center p-4"
        :style="{ minHeight: maxHeight }"
      >
        <BaseButton primary @click="mint()">
          MINT for {{ minMintPrice }} {{ mintCurrency }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
