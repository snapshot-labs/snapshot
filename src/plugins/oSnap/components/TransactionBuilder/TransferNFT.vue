<script setup lang="ts">
import { shorten } from '@/helpers/utils';
import { NFT, Network, TransferNftTransaction } from '../../types';
import { processTransferNftInput } from '../../utils';
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
  // if (!isAddress(recipient.value) || !selectedCollectable.value) return;
  const processedTransaction = processTransferNftInput({
    safeAddress: props.safeAddress,
    recipient: recipient.value,
    collectible: selectedCollectable.value
  });
  emit('updateTransaction', processedTransaction);
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
