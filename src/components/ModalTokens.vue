<script setup lang="ts">
import { isAddress } from '@ethersproject/address';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { ERC20ABI } from '@/helpers/constants';
import { Token } from '@/helpers/alchemy';
import Multicaller from '@/helpers/multicaller';

const props = defineProps<{
  selectedToken?: Token;
  open: boolean;
  tokens: Token[];
  network: string;
}>();

const emit = defineEmits(['close', 'update:selectedToken', 'addCustomToken']);

const searchInput = ref('');
const maxTokens = ref(20);
const customTokenLoading = ref(false);
const customToken: Ref<Token | null> = ref(null);
const isSearchValueValidToken = ref(false);

const tokensFiltered = computed(() => {
  if (customToken.value && isSearchValueValidToken.value) {
    return [customToken.value];
  }

  const filterTokens = (token: Token) => {
    const tokenProperties = [
      token.symbol,
      token.name,
      token.contractAddress
    ].map(property => property?.toLowerCase());

    const searchQuery = searchInput.value.toLowerCase();

    const searchMatch = tokenProperties.some(
      property => property?.includes(searchQuery)
    );

    return searchMatch || !searchInput.value;
  };

  return props.tokens.filter(filterTokens).slice(0, maxTokens.value);
});

function handleTokenClick(token: Token) {
  emit('update:selectedToken', token.contractAddress);
  emit('close');
}

async function fetchCustomToken(address: string) {
  if (props.tokens.find(asset => asset.contractAddress === address)) return;

  customTokenLoading.value = true;

  const provider = getProvider(props.network);
  const tokens = [address];

  try {
    const multi = new Multicaller(props.network, provider, ERC20ABI);
    tokens.forEach(token => {
      multi.call(`${token}.name`, token, 'name');
      multi.call(`${token}.symbol`, token, 'symbol');
      multi.call(`${token}.decimals`, token, 'decimals');
      multi.call(`${token}.balance`, token, 'balanceOf', [searchInput.value]);
    });

    const result = await multi.execute();

    const fetchedToken = result[address];

    customToken.value = {
      logo: null,
      contractAddress: address,
      symbol: fetchedToken.symbol,
      name: fetchedToken.name,
      tokenBalance: fetchedToken.balance._hex,
      decimals: fetchedToken.decimals,
      price: 0,
      change: 0,
      value: 0
    };

    emit('addCustomToken', customToken.value);
    isSearchValueValidToken.value = true;
  } catch (e) {
    isSearchValueValidToken.value = false;
  } finally {
    customTokenLoading.value = false;
  }
}

watch(searchInput, value => {
  if (!isAddress(value)) {
    customToken.value = null;
    return;
  }

  fetchCustomToken(value);
});
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
        <LoadingList v-if="customTokenLoading" class="p-4" />
        <template v-else>
          <ModalTokensItem
            v-for="token in tokensFiltered"
            :key="token.contractAddress"
            :token="token"
            :is-selected="
              token.contractAddress === selectedToken?.contractAddress
            "
            :network="network"
            @select="handleTokenClick"
          />

          <div
            v-if="searchInput.length && tokensFiltered.length === 0"
            class="flex flex-row content-start items-start justify-center py-4"
          >
            <span>{{ $t('noResultsFound') }}</span>
          </div>
        </template>
      </div>
    </template>
  </BaseModal>
</template>
