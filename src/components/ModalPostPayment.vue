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
  <BaseModal :open="open" max-height="550px" @close="$emit('close')">
    <template #header>
      <h3>Transaction submitted</h3>
    </template>
    <div class="flex w-full flex-col space-y-2 p-4">
      <BaseBlock slim title="Transaction hash">
        <template #button>
          <div class="flex gap-3">
            <BaseLink
              v-tippy="{ content: 'View transaction in explorer' }"
              :link="
                explorerUrl(tx.network.toString(), tx.hash as string, 'tx')
              "
              class="text-skin-text pt-[3px] transition-colors duration-200 hover:text-skin-link"
              hide-external-icon
            >
              <i-ho-external-link />
            </BaseLink>

            <BaseButtonIcon
              v-tippy="{ content: 'Copy transaction hash' }"
              @click="copyToClipboard(tx.hash)"
            >
              <i-ho-duplicate />
            </BaseButtonIcon>
          </div>
        </template>
        <div class="p-3">
          <b class="my-3 font-mono break-all text-skin-link">{{ tx.hash }}</b>
        </div>
      </BaseBlock>

      <p>
        Copy the transaction hash above and use on the payment form as proof of
        payment.
      </p>
    </div>
  </BaseModal>
</template>
