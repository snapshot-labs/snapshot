<script setup lang="ts">
import { explorerUrl, shorten } from '@/helpers/utils';

defineProps<{
  open: boolean;
}>();

defineEmits(['close']);

const { pendingTransactionsWithHash } = useTxStatus();
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('setup.pendingTransactions') }}</h3>
    </template>
    <div class="flex w-full flex-col space-y-2 p-4">
      <BaseLink
        v-for="tx in pendingTransactionsWithHash"
        :key="tx.id"
        :link="explorerUrl(tx.network, tx.hash as string, 'tx')"
        class="flex w-full flex-row items-center truncate rounded-lg border p-2 !text-skin-text hover:!text-skin-link"
        @click.stop
      >
        {{ shorten(tx.hash as string) }}
      </BaseLink>
    </div>
  </BaseModal>
</template>
