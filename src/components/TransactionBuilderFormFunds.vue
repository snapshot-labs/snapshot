<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { PopoverButton } from '@headlessui/vue';
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { FundsAsset, getSafeFunds, Safe } from '@/helpers/safe';
import {
  decodeERC20TransferData,
  encodeERC20TransferData,
  Transaction,
  TransactionOperationType
} from '@/helpers/transactionBuilder';
import { FormError } from '@/helpers/interfaces';

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
const tokenAddress = ref<string>('');
const recipient = ref<string>('');
const amount = ref<BigNumber>(BigNumber.from(0));

const tokenAddressError = computed<FormError | null>(() => {
  if (!tokenAddress.value) return null;

  if (!isAddress(tokenAddress.value)) return { message: 'Invalid address' };

  return null;
});

const recipientError = computed<FormError | null>(() => {
  if (recipient.value === '') return { message: 'Recipient is required' };
  if (!isAddress(recipient.value))
    return { message: 'Recipient is not a valid address' };

  return null;
});

const amountError = computed<FormError | null>(() => {
  if (amount.value.eq(0)) return { message: 'Amount is required' };

  return null;
});

async function populateForm() {
  if (!props.showForm) return;

  safeFunds.value = await getSafeFunds(props.safe.network, props.safe.address);

  if (props.transaction) {
    if (props.transaction.data === '0x') {
      tokenAddress.value = '';
      recipient.value = props.transaction.to;
      amount.value = props.transaction.value;
    } else {
      const params = decodeERC20TransferData(props.transaction.data);
      tokenAddress.value = props.transaction.to;
      recipient.value = params.recipient;
      amount.value = params.amount;
    }
  }
}

function closeAndClearForm() {
  emit('close');

  tokenAddress.value = '';
  recipient.value = '';
  amount.value = BigNumber.from(0);
}

function saveTransaction() {
  if (tokenAddress.value) {
    emit('saveTransaction', {
      to: tokenAddress.value,
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
        <LabelInput>Token address</LabelInput>
        <div class="flex space-x-2">
          <InputString
            v-model="tokenAddress"
            placeholder="Sending native asset"
            :error="(tokenAddressError as FormError)"
          />
          <BasePopover>
            <template #button>
              <ButtonSidebar class="relative !h-[46px] !w-[46px]">
                <i-ho-cash />
              </ButtonSidebar>
            </template>
            <template #content>
              <PopoverButton
                v-for="(asset, index) in safeFunds"
                :key="index"
                as="div"
                class="cursor-pointer px-3 py-2 hover:bg-skin-border"
                @click="tokenAddress = asset.tokenAddress || ''"
              >
                <div class="text-sm text-skin-link">
                  {{ asset.tokenAddress }}
                </div>
                <div>
                  {{ asset.name }} ({{ asset.symbol }})<br />
                  {{ asset.safeBalance }}
                </div>
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
            :model-value="amount.toString()"
            :error="(amountError as FormError)"
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
