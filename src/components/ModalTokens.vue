<script setup lang="ts">
import { TokenlistToken } from '@/helpers/interfaces';

const props = defineProps<{
  selectedToken?: TokenlistToken;
  open: boolean;
  tokens: TokenlistToken[];
  network: string;
}>();

const emit = defineEmits(['close', 'update:selectedToken']);

const searchInput = ref('');
const maxTokens = ref(20);

const tokensFiltered = computed(() => {
  const filterTokens = (token: TokenlistToken) => {
    const tokenProperties = [token.symbol, token.name, token.address].map(
      property => property.toLowerCase()
    );

    const searchQuery = searchInput.value.toLowerCase();

    const searchMatch = tokenProperties.some(property =>
      property.includes(searchQuery)
    );

    return searchMatch || !searchInput.value;
  };

  return props.tokens.filter(filterTokens).slice(0, maxTokens.value);
});

function handleTokenClick(token) {
  emit('update:selectedToken', token.address);
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
        />
      </div>
    </template>

    <template #default="{ maxHeight }">
      <div
        class="flex w-full flex-col overflow-auto"
        :style="{ minHeight: maxHeight }"
      >
        <ModalTokensItem
          v-for="token in tokensFiltered"
          :key="token.address"
          :token="token"
          :is-selected="token.address === selectedToken?.address"
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
</template>
