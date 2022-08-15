<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import Plugin from '../../index';
import { transferNftToModuleTransaction } from '@/plugins/safeSnap/utils/transactions';
import { getERC721TokenTransferTransactionData } from '@/plugins/safeSnap/utils/abi';
import { isAddress } from '@ethersproject/address';
import { shorten } from '@/helpers/utils';
import SafeSnapInputAddress from '../Input/Address.vue';

const props = defineProps(['modelValue', 'nonce', 'config']);
const emit = defineEmits(['update:modelValue']);

const plugin = new Plugin();

const collectables = ref<any[]>([]);
const to = ref('');
const collectableAddress = ref('');

const selectedCollectable = computed(() => {
  if (!collectableAddress.value) return null;
  return collectables.value.find(
    collectable => collectable.address === collectableAddress.value
  );
});

const updateTransaction = () => {
  if (props.config.preview) return;
  try {
    if (isAddress(to.value)) {
      const data = getERC721TokenTransferTransactionData(
        props.config.gnosisSafeAddress,
        to.value,
        selectedCollectable.value.id
      );

      const transaction = transferNftToModuleTransaction({
        data,
        nonce: props.nonce,
        recipient: to.value,
        collectable: selectedCollectable.value
      });

      if (plugin.validateTransaction(transaction)) {
        emit('update:modelValue', transaction);
        return;
      }
    }
  } catch (error) {
    console.warn('invalid transaction');
  }
  emit('update:modelValue', undefined);
};

const setCollectables = () => {
  if (!props.config.preview && props.config.collectables) {
    collectables.value = props.config.collectables;
    if (!selectedCollectable.value && collectables.value.length) {
      collectableAddress.value = collectables.value[0].address;
    }
  }
};

watch([to, collectableAddress, props.config], () => {
  updateTransaction();
});

onMounted(() => {
  setCollectables();
  if (props.modelValue) {
    const { recipient = '', collectable } = props.modelValue;
    to.value = recipient;
    if (collectable) {
      collectableAddress.value = collectable.address;
      collectables.value = [collectable];
    }
  }
});
</script>

<template>
  <UiSelect v-model="collectableAddress" :disabled="config.preview">
    <template #label>{{ $t('safeSnap.asset') }}</template>
    <template v-if="selectedCollectable && selectedCollectable.logoUri" #image>
      <img
        :src="selectedCollectable.imageUri"
        alt=""
        class="ml-2 w-4 align-middle"
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
      {{ collectable.name }} #{{ shorten(collectable.id, 10) }}
    </option>
  </UiSelect>

  <SafeSnapInputAddress
    v-model="to"
    :disabled="config.preview"
    :input-props="{
      required: true
    }"
    :label="$t('safeSnap.to')"
  />
</template>
