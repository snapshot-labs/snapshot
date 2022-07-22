<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';
import { getTokenPrices } from '@/helpers/covalent';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const emit = defineEmits(['next']);

const { form } = useSpaceSettingsForm();

const tokenStandards = computed(() => {
  return ['ERC-20', 'ERC-721', 'ERC-1155'].map((name, i) => ({
    id: i + 1,
    name: name
  }));
});

const input = ref({
  network: '1',
  address: ''
});

const defaultToken = {
  standard: tokenStandards.value[0],
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

  if (token.value.standard.name === 'ERC-20') {
    strategy.name = 'erc20-balance-of';
  } else if (token.value.standard.name === 'ERC-721') {
    strategy.name = 'erc721';
  } else if (token.value.standard.name === 'ERC-1155') {
    strategy.name = 'erc1155-balance-of';
  } else strategy.name = '';

  return strategy;
});

function nextStep() {
  emit('next');
  if (strategy.value?.params?.symbol) {
    form.value.strategies = [];
    form.value.strategies.push(strategy.value);
    form.value.symbol = strategy.value.params.symbol;
  }
}

async function getTokenInfo() {
  const res = await getTokenPrices(input.value.address, input.value.network);
  if (!res.data) return (token.value = clone(defaultToken));
  token.value.decimals = res.data[0].contract_decimals;
  token.value.symbol = res.data[0].contract_ticker_symbol;
}

watch(
  input,
  async () => {
    getTokenInfo();
  },
  { deep: true }
);
</script>

<template>
  <div class="mt-4 space-y-4">
    <BaseBlock title="Setup token voting">
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
          <BaseInput
            v-model.trim="input.address"
            title="Token contract"
            placeholder="Enter address"
            focus-on-mount
          />

          <BaseInput
            v-if="token.symbol"
            v-model="token.symbol"
            title="Symbol"
          />
          <BaseInput
            v-if="token.decimals"
            v-model="token.decimals"
            title="Decimals"
          />
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
