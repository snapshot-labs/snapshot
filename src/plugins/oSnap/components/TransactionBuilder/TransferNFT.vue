<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { isAddress } from '@ethersproject/address';
import { NFT, Network, TransferNftTransaction } from '../../types';
import {
  createTransferNftTransaction,
  getERC721TokenTransferTransactionData,
  validateTransaction
} from '../../utils';
import AddressInput from '../Input/Address.vue';

const props = defineProps<{
  network: Network;
  collectables: NFT[];
  transaction: TransferNftTransaction;
  safeAddress: string;
}>();

const emit = defineEmits<{
  updateTransaction: [transaction: TransferNftTransaction];
}>();

const recipient = ref(props.transaction.recipient ?? '');
const selectedCollectableAddress = ref(
  props.transaction.collectable?.address ?? ''
);

const selectedCollectable = computed(() => {
  return props.collectables.find(
    collectable => collectable?.address === selectedCollectableAddress.value
  );
});

function updateTransaction() {
  if (!isAddress(recipient.value) || !selectedCollectable.value) return;

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
  <UiSelect v-model="selectedCollectableAddress">
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
      {{ collectable.name ?? collectable.tokenName }} #{{
        shorten(collectable.id, 10)
      }}
    </option>
  </UiSelect>

  <AddressInput
    v-model="recipient"
    :input-props="{
      required: true
    }"
    :label="$t('safeSnap.to')"
  />
</template>
