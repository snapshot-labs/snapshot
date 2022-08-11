<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useSpaceForm, useI18n } from '@/composables';
import { getTokenPrices } from '@/helpers/covalent';
import { call, clone } from '@snapshot-labs/snapshot.js/src/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ERC20ABI } from '@/helpers/abi';

const emit = defineEmits(['next']);

const { form, setDefaultStrategy } = useSpaceForm('setup');
const { t } = useI18n();

const tokenStandards = computed(() => {
  return ['ERC-20', 'ERC-721', 'ERC-1155'].map(name => ({
    value: name
  }));
});

const input = ref({
  network: '1',
  address: ''
});

const defaultToken = {
  name: '',
  logo: '',
  standard: 'ERC-20',
  symbol: '',
  decimals: null
};

const token = ref(clone(defaultToken));

const strategy = computed(() => {
  let name = 'erc20-balance-of';
  if (token.value.standard === 'ERC-721') {
    name = 'erc721';
  } else if (token.value.standard === 'ERC-1155') {
    name = 'erc1155-balance-of';
  }

  return {
    name,
    network: input.value.network,
    params: {
      network: input.value.network,
      address: input.value.address,
      decimals: token.value.decimals,
      symbol: token.value.symbol
    }
  };
});

function setFormValues() {
  if (
    form.value.strategies.length === 1 &&
    !['whitelist', 'ticket'].includes(form.value.strategies[0].name)
  ) {
    input.value = {
      network: form.value.strategies[0].params.network,
      address: form.value.strategies[0].params.address
    };

    if (form.value.strategies[0].name === 'erc721') {
      token.value.standard = 'ERC-721';
    } else if (form.value.strategies[0].name === 'erc1155-balance-of') {
      token.value.standard = 'ERC-1155';
    }

    token.value.symbol = form.value.strategies[0].params.symbol;
    token.value.decimals = form.value.strategies[0].params.decimals;
  }
}

function nextStep() {
  emit('next');
  if (!strategy.value?.params?.symbol) {
    setDefaultStrategy();
    return;
  }

  form.value.strategies = [];
  form.value.strategies.push(strategy.value);
  form.value.symbol = strategy.value.params.symbol;
}

const isTokenLoading = ref(false);
const tokenError = ref('');

async function getTokenInfo() {
  tokenError.value = '';
  isTokenLoading.value = true;
  const { data } = await getTokenPrices(
    input.value.address,
    input.value.network
  );

  if (data?.[0]?.contract_name) {
    token.value.name = data[0].contract_name;
    token.value.logo = data[0].logo_url;
    token.value.symbol = data[0].contract_ticker_symbol;
    token.value.decimals = data[0].contract_decimals;
    isTokenLoading.value = false;
  } else {
    try {
      // TODO: use brovider(?)
      const provider = new JsonRpcProvider(
        networks[input.value.network].rpc[0]
      );
      const tokenInfo = await Promise.all([
        call(provider, ERC20ABI, [input.value.address, 'name', []]),
        call(provider, ERC20ABI, [input.value.address, 'symbol', []]),
        call(provider, ERC20ABI, [input.value.address, 'decimals', []])
      ]);
      token.value.name = tokenInfo[0];
      token.value.symbol = tokenInfo[1];
      token.value.decimals = tokenInfo[2];
    } catch {
      tokenError.value = t('setup.strategy.tokenVoting.tokenNotFound');
      token.value = clone(defaultToken);
    } finally {
      isTokenLoading.value = false;
    }
  }
}

watch(
  input,
  async () => {
    getTokenInfo();
  },
  { deep: true }
);

onMounted(setFormValues);
</script>

<template>
  <div class="mt-4 space-y-4">
    <BaseBlock :title="$t('setup.strategy.blockTitle')">
      <div class="flex md:w-2/3">
        <div class="w-full space-y-3">
          <ComboboxNetwork
            :network="input.network"
            @select="value => (input.network = value)"
          />
          <BaseListbox
            v-model="token.standard"
            :items="tokenStandards"
            label="Token standard"
          />
          <div>
            <BaseInput
              v-model.trim="input.address"
              title="Token contract"
              placeholder="Enter address"
              :error="{ message: !token.name ? tokenError : '', push: true }"
              :loading="isTokenLoading"
              focus-on-mount
            />
          </div>
        </div>
      </div>
    </BaseBlock>

    <BaseBlock v-if="token.name" class="!mt-3 space-x-1 text-left text-sm">
      <div class="flex justify-between">
        <div class="flex items-center gap-1 truncate">
          <AvatarToken
            v-if="token.logo"
            :src="token.logo"
            :address="input.address"
            class="mr-1"
            size="30"
          />
          <div class="truncate">
            <div class="mr-4 truncate whitespace-nowrap text-skin-link">
              {{ token.name }}
            </div>
            <BasePill class="py-1">${{ token.symbol }}</BasePill>
          </div>
        </div>
        <div class="flex items-center">
          <BaseLink
            v-if="input.network == '1'"
            class="text-skin-text hover:text-skin-link"
            :link="`https://etherscan.io/token/${input.address}`"
          >
            {{ $t('See on Etherscan') }}
          </BaseLink>
        </div>
      </div>
    </BaseBlock>

    <div class="float-right mx-4 md:mx-0">
      <SetupButtonNext
        class="!mt-0"
        :disabled="isTokenLoading"
        :text="strategy?.params?.symbol ? 'next' : 'skip'"
        @click="nextStep"
      />
    </div>
  </div>
</template>
