<script setup lang="ts">
import { useConfirmDialog } from '@vueuse/core';
import { TokenAsset } from '@/helpers/interfaces';
import TokensModalItem from './TokensModalItem.vue';
import { TuneListbox } from '@snapshot-labs/tune';

const props = defineProps<{
  open: boolean;
  tokenAddress: string;
  tokens: TokenAsset[];
}>();

const emit = defineEmits(['close', 'tokenAddress']);

const { t } = useI18n();

const query = ref('');
const filter = ref('verifiedTokens');
const filters = [
  { value: 'verifiedTokens', name: t('Verified tokens') },
  { value: 'allTokens', name: t('All tokens') }
];

const confirmDialogOpen = ref(false);
const confirmDialogData = ref(null);
const confirmDialog = useConfirmDialog(confirmDialogOpen);
confirmDialog.onConfirm(token => {
  // console.log(':confirmDialog.onConfirm', token);
  emit('tokenAddress', token.address);
  emit('close');
});

const tokensFiltered = computed(() => {
  return props.tokens.filter(token => {
    const filters: boolean[] = [];

    if (query.value) {
      const queryLower = query.value.toLowerCase();
      const symbol = token.symbol.toLowerCase();
      const name = token.name.toLowerCase();
      filters.push(symbol.includes(queryLower) || name.includes(queryLower));
    }

    filters.push(
      filter.value === 'verifiedTokens'
        ? token.address === 'main' || token.verified !== undefined
        : true
    );

    return !filters.includes(false);
  });
});

function handleTokenClick(token) {
  // console.log(':handleTokenClick', token);
  const isVerified = token.address === 'main' || token.verified !== undefined;

  if (!isVerified) {
    confirmDialogData.value = token;
    return confirmDialog.reveal();
  }

  emit('tokenAddress', token.address);
  emit('close');
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <div
        class="flex flex-col content-center items-center justify-center gap-x-4"
      >
        <h3>{{ $t('Assets') }}</h3>
        <BaseSearch
          v-model="query"
          :placeholder="$t('Search token')"
          modal
          focus-on-mount
          class="min-h-[60px] w-full flex-auto px-3 pb-3"
        >
          <template #after>
            <TuneListbox
              v-model="filter"
              :items="filters"
              class="min-w-[180px]"
            />
          </template>
        </BaseSearch>
      </div>
    </template>

    <template #default="{ maxHeight }">
      <div
        class="flex w-full flex-col overflow-auto"
        :style="{ minHeight: maxHeight }"
      >
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
      :open="confirmDialogOpen"
      show-cancel
      @close="confirmDialog.cancel"
      @confirm="confirmDialog.confirm(confirmDialogData)"
    >
      <BaseMessageBlock level="warning" class="m-4">
        {{ $t('Token is not verified by Snapshot. Confirm to continue.') }}
        <a href="https://docs.snapshot.org/" target="_blank">
          {{ $t('Click for more info.') }}
        </a>
      </BaseMessageBlock>
    </ModalConfirmAction>
  </teleport>
</template>
