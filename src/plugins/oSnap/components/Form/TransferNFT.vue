<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import {
  createTransferNftTransaction,
  getERC721TokenTransferTransactionData,
  validateTransaction
} from '../../index';
import { NFT, Network, TransferNftTransaction } from '../../types';
import AddressInput from '../Input/Address.vue';

const props = defineProps<{
  isProposal: boolean;
  network: Network;
  collectables: NFT[];
  transaction: TransferNftTransaction;
  safeAddress: string;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: TransferNftTransaction];
}>();

const recipient = ref('');
const selectedCollectableAddress = ref('');

const selectedCollectable = computed(() => {
  if (!selectedCollectableAddress.value) return;
  return props.collectables.find(
    collectable => collectable.address === selectedCollectableAddress.value
  );
});

function updateTransaction() {
  if (
    props.isProposal ||
    !isAddress(recipient.value) ||
    !selectedCollectable.value
  )
    return;

  try {
    const data = getERC721TokenTransferTransactionData(
      props.safeAddress,
      recipient.value,
      selectedCollectable.value.id
    );

    const transaction = createTransferNftTransaction({
      data,
      recipient: recipient.value,
      collectable: selectedCollectable.value
    });

    if (validateTransaction(transaction)) {
      emit('updateTransaction', transaction);
      return;
    }
  } catch (error) {
    console.warn('invalid transaction');
  }
}

watch(recipient, updateTransaction);
watch(selectedCollectableAddress, updateTransaction);
</script>

<template>
  <div v-if="isProposal">
    <p>recipient: {{ transaction.recipient }}</p>
    <p>collectable: {{  transaction.collectable.name ?? transaction.collectable.tokenName }} #{{ transaction.collectable.id }}</p>
    <p>address: {{ transaction.collectable.address }}</p>
  </div>
  <template v-else>
    <UiSelect v-model="selectedCollectableAddress" :disabled="isProposal">
      <template #label>{{ $t('safeSnap.asset') }}</template>
      <template
        v-if="
          selectedCollectable &&
          (selectedCollectable.imageUri || selectedCollectable.logoUri)
        "
        #image
      >
        <img
          :src="selectedCollectable.imageUri || selectedCollectable.logoUri"
          alt=""
          class="tokenImage"
        />
      </template>
      <option v-if="!collectables.length" disabled selected>
        - {{ $t('safeSnap.noCollectibles') }} -
      </option>
      <option
        v-for="(collectable, index) in collectables"
        :key="index"
        :value="collectable.address"
      >
        {{ collectable.name ?? collectable.tokenName }} #{{ shorten(collectable.id, 10) }}
      </option>
    </UiSelect>

    <AddressInput
      v-model="recipient"
      :disabled="isProposal"
      :input-props="{
        required: true
      }"
      :label="$t('safeSnap.to')"
    />
  </template>
</template>

<style scoped>
.tokenImage {
  width: 24px;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
../../types/types
