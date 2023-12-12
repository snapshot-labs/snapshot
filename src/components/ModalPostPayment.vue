<script setup lang="ts">
import { explorerUrl } from '@/helpers/utils';

defineProps<{
  open: boolean;
  tx: any;
}>();
const { copyToClipboard } = useCopy();

defineEmits(['close']);
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>Payment result</h3>
    </template>
    <div class="flex w-full flex-col space-y-2 p-4 text-center">
      <p>
        Your payment transaction has been submitted, copy the transaction hash
        below and use on the payment form as proof of payment.
      </p>

      <div
        class="w-full items-center rounded-lg border p-4 py-3 !text-skin-text"
      >
        <b class="font-mono break-all text-lg">{{ tx.hash }}</b>
      </div>
      <TuneButton primary @click="copyToClipboard(tx.hash)">
        Copy transaction hash
      </TuneButton>

      <BaseLink
        :link="explorerUrl(tx.network.toString(), tx.hash as string, 'tx')"
      >
        View transaction in explorer
      </BaseLink>
    </div>
    <template #footer>
      <TuneButton type="button" class="w-full" @click="$emit('close')">
        {{ $t('close') }}
      </TuneButton>
    </template>
  </BaseModal>
</template>
