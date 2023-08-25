<script setup lang="ts">
import { useConfirmDialog } from '@vueuse/core';
import { TokenAsset } from '@/helpers/interfaces';
import TokensModalItem from './TokensModalItem.vue';

const props = defineProps<{
  open: boolean;
  tokenAddress: string;
  tokens: TokenAsset[];
  network: string;
}>();

const emit = defineEmits(['close', 'tokenAddress']);

const searchInput = ref('');
const showUnverifiedTokens = ref(false);

const confirmDialogOpen = ref(false);
const confirmDialogData = ref(null);
const confirmDialog = useConfirmDialog(confirmDialogOpen);
confirmDialog.onConfirm(token => {
  emit('tokenAddress', token.address);
  emit('close');
});

const tokensFiltered = computed(() => {
  const filterTokens = (token: TokenAsset) => {
    const tokenProperties = [token.symbol, token.name, token.address].map(
      property => property.toLowerCase()
    );

    const searchQuery = searchInput.value.toLowerCase();

    const searchMatch = tokenProperties.some(property =>
      property.includes(searchQuery)
    );
    const isVerified = token.address === 'main' || token.verified;

    return (
      (searchMatch || !searchInput.value) &&
      (showUnverifiedTokens.value || isVerified)
    );
  };

  return props.tokens.filter(filterTokens);
});

function handleTokenClick(token) {
  const isVerified = token.address === 'main' || token.verified;

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
        <h3>Assets</h3>
        <BaseSearch
          v-model="searchInput"
          :placeholder="$t('searchPlaceholderTokens')"
          modal
          focus-on-mount
          class="min-h-[60px] w-full flex-auto !px-3 pb-3 sm:!px-4"
        >
          <template #after>
            <BasePopover :focus="false">
              <template #button>
                <BaseButtonIcon>
                  <i-ho-adjustments class="text-skin-link" />
                </BaseButtonIcon>
              </template>
              <template #content>
                <h3 class="-mb-2 mt-3 text-center text-skin-heading">
                  Filters
                </h3>
                <div class="m-4 space-y-3">
                  <div class="space-y-2">
                    <div class="space-y-2">
                      <TuneCheckbox
                        v-model="showUnverifiedTokens"
                        hint="Show unverified tokens"
                        name="searchOnlyWithReason"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </BasePopover>
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
          :network="network"
          @select="handleTokenClick"
        />

        <div
          v-if="searchInput.length && tokensFiltered.length === 0"
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
      <BaseMessageBlock level="warning-red" class="m-4">
        This token isn't known to us. Please make sure it is the correct address
        before proceeding.
        <BaseLink
          link="https://docs.snapshot.org/user-guides/token-verification"
        >
          {{ $t('learnMore') }}</BaseLink
        >
      </BaseMessageBlock>
    </ModalConfirmAction>
  </teleport>
</template>
