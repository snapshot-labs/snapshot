<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';

defineProps<{
  open: boolean;
}>();

const { copyToClipboard } = useCopy();

const tx = {
  hash: '0xc3c6e126edc7cb0e4413bdd2ccc38194ca4f169b9a993fa9ace045efec5fa09f',
  network: 5
};

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
        <span class="text-[20px] font-bold leading-none text-yellow-300">
          Waiting confirmation
        </span>
      </div>

      <p>
        Once your transaction is confirmed, copy the transaction hash below and
        use on the payment form as proof of payment.
      </p>

      <div
        :link="explorerUrl(tx.network, tx.hash as string, 'tx')"
        class="w-full items-center rounded-lg border p-4 py-3 !text-skin-text"
      >
        <i-ho-duplicate
          class="ml-2 text-xs cursor-pointer float-right"
          @click="copyToClipboard(tx.hash)"
        />
        <b class="font-mono break-all text-lg">{{ tx.hash }}</b>
      </div>
    </div>
  </BaseModal>
</template>
