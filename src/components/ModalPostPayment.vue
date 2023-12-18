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
      <h3>Transaction submitted</h3>
    </template>
    <div class="mx-4 mb-4">
      <p class="mt-2 mb-3 text-center">
        Copy the transaction hash above and use on the payment form as proof of
        payment.
      </p>
      <div class="flex w-full flex-col space-y-2">
        <BaseBlock slim class="p-3">
          <b class="font-mono break-all text-skin-link">{{ tx.hash }}</b>
        </BaseBlock>

        <div class="flex">
          <BaseLink
            v-tippy="{ content: 'View transaction in explorer' }"
            :link="explorerUrl(tx.network.toString(), tx.hash as string, 'tx')"
            class="text-skin-text"
          >
            View in explorer
          </BaseLink>
          <div class="flex-grow"></div>

          <button
            v-tippy="{ content: 'Copy transaction hash' }"
            class="text-skin-text"
            @click="copyToClipboard(tx.hash)"
          >
            <i-ho-duplicate class="inline-block text-xs" />
            Copy tx hash
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
