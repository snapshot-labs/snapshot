<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { BigNumber } from '@ethersproject/bignumber';
import { TokenAsset } from '@/helpers/safe';
import { TokenTransaction } from '@/helpers/transactionBuilder';

const props = defineProps<{
  transaction: TokenTransaction;
}>();

const emit = defineEmits<{
  (e: 'updateTransaction', transaction: TokenTransaction): void;
}>();

const selectedToken = ref<TokenAsset | undefined>(undefined);
const recipient = ref<string>(props.transaction.recipient);
const amount = ref<BigNumber>(props.transaction.amount);

const availableFunds = ref<TokenAsset[]>([]);
const getAvailableFunds = inject('getAvailableFunds') as () => Promise<
  TokenAsset[]
>;

const loadingAvailableFunds = ref<boolean>(true);
onMounted(async () => {
  availableFunds.value = await getAvailableFunds();
  selectedToken.value = availableFunds.value.find(
    token => token.address === props.transaction.tokenAddress
  );
  loadingAvailableFunds.value = false;
});

const fundsOptions = computed(() =>
  availableFunds.value.map(token => ({
    extras: token,
    value: token
  }))
);

watch([selectedToken, recipient, amount], () => {
  emit('updateTransaction', {
    ...props.transaction,
    recipient: recipient.value,
    amount: amount.value || '',
    tokenAddress: selectedToken.value?.address || ''
  });
});
</script>

<template>
  <div v-if="loadingAvailableFunds" class="flex justify-center">
    <LoadingSpinner />
  </div>
  <div v-else class="space-y-2">
    <BaseListbox v-model="selectedToken" :items="fundsOptions" label="Currency">
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
        :disabled="!selectedToken"
      />
    </div>
    <div>
      <LabelInput>Amount</LabelInput>
      <InputNumber
        :model-value="amount.toString()"
        :disabled="!selectedToken"
        @update:model-value="amount = BigNumber.from($event)"
      />
    </div>
  </div>
</template>
