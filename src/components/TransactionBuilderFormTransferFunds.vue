<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { BigNumber } from '@ethersproject/bignumber';
import { TokenAsset } from '@/helpers/safe';
import { TokenAssetTransaction } from '@/helpers/transactionBuilder';

const props = defineProps<{
  transaction: TokenAssetTransaction;
}>();

const emit = defineEmits<{
  (e: 'updateTransaction', transaction: TokenAssetTransaction): void;
}>();

const availableFunds = ref<TokenAsset[]>([]);
const getAvailableFunds = inject('getAvailableFunds') as () => Promise<
  TokenAsset[]
>;
onMounted(async () => {
  availableFunds.value = await getAvailableFunds();
  console.log(availableFunds.value);
});

const fundsOptions = computed(() =>
  availableFunds.value.map(token => ({
    extras: token,
    value: token
  }))
);

const selectedToken = ref<TokenAsset | undefined>(props.transaction.token);
const recipient = ref<string>(props.transaction.recipient);
const amount = ref<BigNumber>(props.transaction.amount);

watch([selectedToken, recipient, amount], () => {
  emit('updateTransaction', {
    ...props.transaction,
    to: selectedToken.value?.address || '',
    recipient: recipient.value,
    amount: amount.value || '',
    token: selectedToken.value
  });
});
</script>

<template>
  <div v-if="fundsOptions.length" class="space-y-2">
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
