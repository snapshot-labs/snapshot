<script setup lang="ts">
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { shorten, explorerUrl } from '@/helpers/utils';
import { TokenAsset } from '@/helpers/interfaces';

const props = defineProps<{
  open: boolean;
  tokenAddress: string;
  tokens: TokenAsset[];
}>();

const emit = defineEmits(['close', 'tokenAddress']);

const query = ref('');

const tokensFiltered = computed(() => {
  if (!query.value) return props.tokens;
  return props.tokens.filter(token => {
    const queryLower = query.value.toLowerCase();
    const symbol = token.symbol.toLowerCase();
    const name = token.name.toLowerCase();
    return symbol.includes(queryLower) || name.includes(queryLower);
  });
});

function addToken() {
  // TODO actual tally link
  window.open('https://tally.so/r/mKzXo7', '_blank');
}

function handleTokenClick(token) {
  console.log(':handleTokenClick', token);
  const isVerified = token.address === 'main' || token.verified !== undefined;

  if (!isVerified) {
    // TODO confirm through modal
    const isApproved = confirm(
      'Token not verified. Please enter the token address to continue.'
    );
    if (!isApproved) return;
  }

  emit('tokenAddress', token.address);
  emit('close');
}

function getTokenExploreUrl(token) {
  let network = '1';
  if (token.verified !== undefined) network = String(token.verified.chainId);
  return explorerUrl(network, token.address);
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
        >
          <template #after>
            <BaseButton class="whitespace-nowrap" @click="addToken()"
              >Add token</BaseButton
            >
          </template>
        </BaseSearch>
      </div>
    </template>

    <template #default="{ maxHeight }">
      <div class="flex w-full flex-col gap-y-2 overflow-auto p-4">
        <button
          v-for="token in tokensFiltered"
          :key="token.address"
          class="flex w-full cursor-pointer flex-row flex-wrap content-center items-center justify-between rounded-xl border border-skin-border p-3 hover:border-skin-link"
          :class="{
            '!border-skin-link': token.address === tokenAddress
          }"
          @click="handleTokenClick(token)"
        >
          <div class="mb-2 flex w-full flex-row justify-between">
            <div class="flex flex-row gap-x-2">
              <span class="text-skin-link">{{ token.symbol }}</span>
              <span class="text-skin-text">{{
                shorten(token.name, 'choice')
              }}</span>
            </div>
            <div class="flex flex-row content-center items-center gap-x-1">
              <template v-if="token.verified || token.address === 'main'">
                <span>Verified</span>
                <i-ho-check-badge class="mb-1 text-xs text-green" />
              </template>
              <template v-else>
                <span>Unverified</span>
                <i-ho-question-mark-circle class="text-xs" />
              </template>
            </div>
          </div>

          <div class="flex w-full flex-row items-center justify-between">
            <div>
              <span>{{ networks[token?.verified?.chainId || '1']?.name }}</span>
            </div>
            <a
              v-if="token.address !== 'main'"
              :href="getTokenExploreUrl(token)"
              target="_blank"
              rel="noopener noreferrer"
              class="flex flex-row content-center items-center gap-x-1 text-skin-text hover:!text-skin-link"
            >
              <span class="">{{ shorten(token.address) }}</span>
              <i-ho-arrow-top-right-on-square class="mb-1 text-xs" />
            </a>
          </div>
        </button>

        <div
          v-if="query.length && tokensFiltered.length === 0"
          class="flex flex-row content-start items-start justify-center py-4"
        >
          <span>{{ $t('noResultsFound') }}</span>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
