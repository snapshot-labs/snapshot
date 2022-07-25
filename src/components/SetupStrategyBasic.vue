<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useSpaceForm, useI18n } from '@/composables';
import { getTokenPrices } from '@/helpers/covalent';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const emit = defineEmits(['next']);

const { form, setDefaultStrategy } = useSpaceForm('setup');
const { t } = useI18n();

const tokenStandards = computed(() => {
  return ['ERC-20', 'ERC-721', 'ERC-1155'].map((name, i) => ({
    id: i + 1,
    name: name,
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
  standard: tokenStandards.value[0].value,
  symbol: '',
  decimals: null
};

const token = ref(clone(defaultToken));

const strategy = computed(() => {
  if (!token.value) return null;

  const strategy: {
    name: string;
    network: string;
    params: {
      network: string;
      address: string;
      decimals?: string;
      symbol?: string;
    };
  } = {
    name: '',
    network: input.value.network,
    params: {
      network: input.value.network,
      address: input.value.address
    }
  };

  if (token.value.decimals) strategy.params.decimals = token.value.decimals;
  if (token.value.symbol) strategy.params.symbol = token.value.symbol;

  if (token.value.standard === 'ERC-20') {
    strategy.name = 'erc20-balance-of';
  } else if (token.value.standard === 'ERC-721') {
    strategy.name = 'erc721';
  } else if (token.value.standard === 'ERC-1155') {
    strategy.name = 'erc1155-balance-of';
  } else strategy.name = '';

  return strategy;
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
      token.value.standard === 'ERC-721';
    } else if (form.value.strategies[0].name === 'erc1155-balance-of') {
      token.value.standard = 'ERC-1155';
    }

    token.value.symbol = form.value.strategies[0].params.symbol;
    token.value.decimals = form.value.strategies[0].params.decimals;
  }
}

function nextStep() {
  emit('next');
  if (!strategy.value?.params?.symbol) return setDefaultStrategy();

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
  isTokenLoading.value = false;

  if (!data?.[0]?.contract_name) {
    tokenError.value = t('setup.strategy.tokenVoting.tokenNotFound');
    token.value = clone(defaultToken);
    return;
  }

  token.value.name = data[0].contract_name;
  token.value.logo = data[0].logo_url;
  token.value.symbol = data[0].contract_ticker_symbol;
  token.value.decimals = data[0].contract_decimals;
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

            <BaseBlock
              v-if="token.name"
              class="mt-3 space-x-1 text-left text-sm"
            >
              <div class="flex justify-between">
                <div class="flex items-center gap-1">
                  <AvatarToken
                    v-if="token.logo"
                    :src="token.logo"
                    :address="token.address"
                    class="mr-1"
                    size="30"
                  />

                  <span class="text-skin-link"> {{ token.name }} </span>
                  <span> ${{ token.symbol }} </span>
                </div>
                <BaseLink
                  v-if="input.network == '1'"
                  class="text-skin-text hover:text-skin-link"
                  :link="`https://etherscan.io/token/${input.address}`"
                >
                  {{ $t('learnMore') }}
                </BaseLink>
              </div>
            </BaseBlock>
          </div>
        </div>
      </div>
    </BaseBlock>

    <div class="float-right mx-4 md:mx-0">
      <SetupButtonNext
        class="!mt-0"
        :text="strategy?.params?.symbol ? 'next' : 'skip'"
        @click="nextStep"
      />
    </div>
  </div>
</template>
