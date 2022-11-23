<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { PopoverButton } from '@headlessui/vue';
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import {
  FundsAsset,
  getSafeFunds,
  Safe,
  Transaction,
  TransactionOperationType
} from '@/helpers/safe';
import {
  decodeERC20TransferData,
  encodeERC20TransferData
} from '@/helpers/abi';
import { FormError } from '@/helpers/interfaces';
import { formatUnits, parseUnits } from '@ethersproject/units';

const DEFAULT_DECIMALS = 18;

const props = defineProps<{
  showForm: boolean;
  transaction: Transaction | null;
  safe: Safe;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saveTransaction', transaction: Transaction): void;
}>();

const safeFunds = ref<FundsAsset[]>([]);
const selectedAsset = ref<FundsAsset | undefined>();
const recipient = ref<string>('');
const amountInput = ref<string>('0');
const amount = computed<BigNumber>(() => {
  try {
    const integerRepresentation = parseUnits(
      amountInput.value,
      selectedAsset.value?.decimals || DEFAULT_DECIMALS
    );
    return BigNumber.from(integerRepresentation);
  } catch (e) {
    return BigNumber.from(0);
  }
});

const recipientError = computed<FormError | null>(() => {
  if (recipient.value === '') return { message: 'Recipient is required' };
  if (!isAddress(recipient.value))
    return { message: 'Recipient is not a valid address' };

  return null;
});

const amountError = computed<FormError | null>(() => {
  try {
    parseUnits(
      amountInput.value,
      selectedAsset.value?.decimals || DEFAULT_DECIMALS
    );
  } catch {
    return { message: 'Invalid amount' };
  }

  if (amount.value.eq(0)) return { message: 'Amount is required' };

  return null;
});

async function populateForm() {
  if (!props.showForm) return;

  safeFunds.value = await getSafeFunds(props.safe.network, props.safe.address);
  selectedAsset.value = safeFunds.value[0] || undefined;

  if (props.transaction) {
    if (props.transaction.data === '0x') {
      selectedAsset.value = safeFunds.value.find(asset => !asset.tokenAddress);
      recipient.value = props.transaction.to;
      amountInput.value = formatUnits(
        props.transaction.value.toString(),
        selectedAsset.value?.decimals || DEFAULT_DECIMALS
      );
    } else {
      const params = decodeERC20TransferData(props.transaction.data);
      selectedAsset.value = safeFunds.value.find(
        asset => asset.tokenAddress === props.transaction!.to
      );
      recipient.value = params.recipient;
      amountInput.value = formatUnits(
        params.amount,
        selectedAsset.value?.decimals || DEFAULT_DECIMALS
      );
    }
  }
}

function closeAndClearForm() {
  emit('close');

  selectedAsset.value = safeFunds.value[0] || undefined;
  recipient.value = '';
  amountInput.value = '0';
}

function saveTransaction() {
  if (selectedAsset.value?.tokenAddress) {
    emit('saveTransaction', {
      to: selectedAsset.value.tokenAddress,
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
      <div v-if="safeFunds.length" class="space-y-2">
        <div>
          <LabelInput>Asset</LabelInput>
          <BasePopover button-classes="w-full">
            <template #button>
              <TransactionBuilderFormFundsAsset
                v-if="selectedAsset"
                :asset="selectedAsset"
                class="w-full rounded-full border pl-2 pr-3"
              />
            </template>
            <template #content>
              <PopoverButton
                v-for="(asset, index) in safeFunds"
                :key="index"
                as="div"
                class="cursor-pointer px-3 py-2 hover:bg-skin-border"
                @click="selectedAsset = asset"
              >
                <TransactionBuilderFormFundsAsset :asset="asset" />
              </PopoverButton>
            </template>
          </BasePopover>
        </div>
        <div>
          <LabelInput>Recipient</LabelInput>
          <InputString
            v-model="recipient"
            placeholder="0x..."
            :error="(recipientError as FormError)"
          />
        </div>
        <div>
          <LabelInput>Amount</LabelInput>
          <InputString
            v-model="amountInput"
            :error="(amountError as FormError)"
          />
        </div>
      </div>
      <div v-else class="py-3 text-center">No assets found in safe.</div>
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
