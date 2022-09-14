<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { FundsAsset } from '@/helpers/safe';
import {
  decodeERC20TransferData,
  encodeERC20TransferData,
  Transaction,
  TransactionOperationType
} from '@/helpers/transactionBuilder';

const props = defineProps<{
  showForm: boolean;
  transaction: Transaction | null;
  availableFunds: FundsAsset[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saveTransaction', transaction: Transaction): void;
}>();

const selectedFundsAsset = ref<FundsAsset | undefined>(undefined);
const recipient = ref<string>('');
const amount = ref<BigNumber>(BigNumber.from(0));

const fundsDropdownOptions = computed(() =>
  props.availableFunds.map(token => ({
    extras: token,
    value: token
  }))
);

const recipientError = computed<{ message: string } | undefined>(() => {
  if (recipient.value === '') return { message: 'Recipient is required' };
  if (!isAddress(recipient.value))
    return { message: 'Recipient is not a valid address' };
  return undefined;
});

const amountError = computed<{ message: string } | undefined>(() => {
  if (amount.value.eq(0)) return { message: 'Amount is required' };
  return undefined;
});

async function populateForm() {
  if (!props.showForm) return;

  selectedFundsAsset.value = props.availableFunds[0];

  if (props.transaction) {
    if (props.transaction.data === '0x') {
      selectedFundsAsset.value = props.availableFunds.find(
        asset => !asset.tokenAddress
      );
      recipient.value = props.transaction.to;
      amount.value = props.transaction.value;
    } else {
      selectedFundsAsset.value = props.availableFunds.find(
        asset => asset.tokenAddress === props.transaction!.to // ! => https://github.com/microsoft/TypeScript/issues/36230
      );
      const params = decodeERC20TransferData(props.transaction.data);
      recipient.value = params.recipient;
      amount.value = params.amount;
    }
  }
}

function closeAndClearForm() {
  emit('close');

  selectedFundsAsset.value = undefined;
  recipient.value = '';
  amount.value = BigNumber.from(0);
}

function saveTransaction() {
  if (selectedFundsAsset.value!.tokenAddress) {
    emit('saveTransaction', {
      to: selectedFundsAsset.value!.tokenAddress,
      value: BigNumber.from(0),
      data: encodeERC20TransferData(recipient.value, amount.value),
      operation: TransactionOperationType.CALL
    });
  } else {
    emit('saveTransaction', {
      to: recipient.value,
      value: amount.value,
      data: '0x',
      operation: TransactionOperationType.CALL
    });
  }

  closeAndClearForm();
}

watch(() => props.showForm, populateForm);
</script>

<template>
  <BaseModal :open="showForm" @close="closeAndClearForm">
    <template #header>
      <h3>Transfer funds</h3>
    </template>

    <BaseContainer class="py-4">
      <div class="space-y-2">
        <BaseListbox
          v-model="selectedFundsAsset"
          :items="fundsDropdownOptions"
          label="Currency"
        >
          <template #selected="{ selectedItem }">
            {{ selectedItem.extras?.name }}
          </template>
          <template #item="{ item }">
            <div class="text-sm text-skin-link">{{ item.extras?.address }}</div>
            <div>
              {{ item.extras?.name }} ({{ item.extras?.symbol }})
              {{ item.extras?.safeBalance }}
            </div>
          </template>
        </BaseListbox>
        <div>
          <LabelInput>Recipient</LabelInput>
          <InputString
            v-model="recipient"
            placeholder="0x..."
            :disabled="!selectedFundsAsset"
            :error="recipientError"
          />
        </div>
        <div>
          <LabelInput>Amount</LabelInput>
          <InputNumber
            :model-value="amount.toString()"
            :disabled="!selectedFundsAsset"
            :error="amountError"
            @update:model-value="amount = BigNumber.from($event || 0)"
          />
        </div>
      </div>
    </BaseContainer>

    <template #footer>
      <BaseButton
        class="w-full"
        primary
        :disabled="!!recipientError || !!amountError"
        @click="saveTransaction"
      >
        save
      </BaseButton>
    </template>
  </BaseModal>
</template>
