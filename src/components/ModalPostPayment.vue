<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';

enum TxStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ERROR = 'error'
}

const props = defineProps<{
  open: boolean;
  tx: any;
  receipt: any;
}>();
const { copyToClipboard } = useCopy();

const status = computed(() => {
  if (props.receipt) {
    if (props.receipt.status === 1) {
      return TxStatus.CONFIRMED;
    } else {
      return TxStatus.ERROR;
    }
  }

  return TxStatus.PENDING;
});

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>Payment result</h3>
    </template>
    <div class="flex w-full flex-col space-y-2 p-4 text-center">
      <div
        class="bg-slate-500/5 flex flex-col border-y border-skin-border bg-skin-block text-base md:rounded-xl md:border p-3 mb-4"
      >
        <span class="text-sm leading-tight">Transaction status</span>
        <span
          class="text-[20px] font-bold leading-none"
          :class="{
            'text-yellow-300': status === TxStatus.CONFIRMED,
            'text-blue-500': status === TxStatus.PENDING,
            'text-red-500': status === TxStatus.ERROR
          }"
        >
          {{
            status === TxStatus.CONFIRMED
              ? 'Confirmed'
              : status === TxStatus.PENDING
                ? 'Waiting confirmation'
                : 'Error'
          }}
        </span>
      </div>

      <p>
        Once your transaction is confirmed, copy the transaction hash below and
        use on the payment form as proof of payment.
      </p>

      <div
        class="w-full items-center rounded-lg border p-4 py-3 !text-skin-text"
      >
        <i-ho-duplicate
          v-tippy="{ content: 'Copy transaction hash' }"
          class="ml-2 text-xs cursor-pointer float-right"
          @click="copyToClipboard(tx.hash)"
        />
        <b class="font-mono break-all text-lg">{{ tx.hash }}</b>
      </div>
      <BaseLink :link="explorerUrl(tx.network, tx.hash as string, 'tx')">
        View transaction in explorer
      </BaseLink>
    </div>
  </BaseModal>
</template>
