<script setup lang="ts">
import { useConfirmDialog } from '@vueuse/core';
import { TokenAsset } from '@/helpers/interfaces';
import TokensModalItem from './TokensModalItem.vue';

const props = defineProps<{
  open: boolean;
  tokenAddress: string;
  tokens: TokenAsset[];
}>();

const emit = defineEmits(['close', 'tokenAddress']);

const query = ref('');

const {
  isRevealed: isConfirmLeaveOpen,
  reveal: openConfirmLeave,
  confirm: confirmLeave,
  cancel: cancelLeave
} = useConfirmDialog();

const tokensFiltered = computed(() => {
  if (!query.value) return props.tokens;
  return props.tokens.filter(token => {
    const queryLower = query.value.toLowerCase();
    const symbol = token.symbol.toLowerCase();
    const name = token.name.toLowerCase();
    return symbol.includes(queryLower) || name.includes(queryLower);
  });
});

function handleTokenClick(token) {
  // console.log(':handleTokenClick', token);
  const isVerified = token.address === 'main' || token.verified !== undefined;

  if (!isVerified) return openConfirmLeave(token);

  emit('tokenAddress', token.address);
  emit('close');
}

function handleConfirmToken(token) {
  // console.log(':handleConfirmToken', token);
  emit('tokenAddress', token.address);
  emit('close');
  confirmLeave(true);
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>Assets</h3>
        <BaseSearch
          v-model="query"
          :placeholder="'Search token'"
          modal
          focus-on-mount
          class="min-h-[60px] w-full flex-auto px-3 pb-3"
        />
      </div>
    </template>

    <template #default="{ maxHeight }">
      <div class="flex w-full flex-col overflow-auto">
        <TokensModalItem
          v-for="token in tokensFiltered"
          :key="token.address"
          :token="token"
          :is-selected="token.address === tokenAddress"
          @select="handleTokenClick"
        />

        <div
          v-if="query.length && tokensFiltered.length === 0"
          class="flex flex-row content-start items-start justify-center py-4"
        >
          <span>{{ $t('noResultsFound') }}</span>
        </div>
      </div>
    </template>
  </BaseModal>

  <teleport to="#modal">
    <ModalConfirmAction
      :open="isConfirmLeaveOpen"
      show-cancel
      @close="cancelLeave"
      @confirm="handleConfirmToken"
    >
      <BaseMessageBlock level="warning" class="m-4">
        {{ $t('Token is not verified by Snapshot. Confirm to continue.') }}
        <a href="https://docs.snapshot.org/" target="_blank">
          Click for more info.
        </a>
      </BaseMessageBlock>
    </ModalConfirmAction>
  </teleport>
</template>
