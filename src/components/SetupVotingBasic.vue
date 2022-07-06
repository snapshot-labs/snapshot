<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const { form } = useSpaceSettingsForm();

const input = ref({
  network: '1',
  address: ''
});
const isSybil = ref(false);
const sybilItems = computed(() => {
  return ['poh', 'brightId'].map((name, i) => ({
    id: i + 1,
    name: name
  }));
});

const selectedSybilItems = ref<{ id: number; name: string }[]>(
  sybilItems.value
);

const emit = defineEmits(['next']);

const token = ref(null);

const strategy = computed(() => {
  if (token.value)
    return generateStrategyFromToken(token.value, input.value.network);
  return null;
});

function generateStrategyFromToken(token, network) {
  const strategy: {
    name: string;
    network: string;
    params: {
      decimals?: string;
      network: string;
      address: string;
      symbol: string;
    };
  } = {
    name: '',
    network,
    params: {
      network: network,
      address: token.contractAddress,
      symbol: ''
    }
  };

  if (token.decimals) strategy.params.decimals = token.decimals;
  if (token.symbol) strategy.params.symbol = token.symbol;

  if (token.type === 'ERC-20') {
    strategy.name = 'erc20-balance-of';
  } else if (token.type === 'ERC-721') {
    strategy.name = 'erc721';
  } else strategy.name = '';

  const sybilStrategy = {
    name: 'sybil-protection',
    params: {
      strategy,
      sybil: {
        poh: '0xC5E9dDebb09Cd64DfaCab4011A0D5cEDaf7c9BDb',
        brightId: 'v5'
      }
    }
  };
  sybilItems.value.forEach(item => {
    // if poh or brightId isn't selected delete it from the sybil obj
    if (!selectedSybilItems.value.find(i => i.id === item.id)) {
      delete sybilStrategy.params.sybil[item.name];
    }
  });
  return isSybil.value ? sybilStrategy : strategy;
}

function nextStep() {
  emit('next');
  if (strategy.value?.name) {
    form.value.strategies = [];
    form.value.strategies.push(strategy.value);
    const symbol =
      strategy.value.params.symbol ||
      strategy.value.params.strategy.params.symbol;
    form.value.symbol = symbol;
  }
}

watch(
  input,
  async () => {
    await fetch(
      `https://blockscout.com/eth/mainnet/api?module=token&action=getToken&contractaddress=${input.value.address}&apikey=4f8b5f8f-f8f8f8f8f-f8f8f8f8f-f8f8f8f8f`
    )
      .then(res => res.json())
      .then(data => {
        token.value = data.result;
      });
  },
  { deep: true }
);
</script>

<template>
  <div class="mt-4 space-y-4">
    <BaseBlock title="Setup token voting">
      <div class="flex space-x-5">
        <div class="w-full space-y-3">
          <ComboboxNetwork
            :network="input.network"
            @select="value => (input.network = value)"
          />
          <BaseInput
            v-model.trim="input.address"
            title="Token contract"
            placeholder="Enter address"
            focus-on-mount
          />
          <div>
            <div class="mb-1 flex">
              <BaseSwitch v-model="isSybil" /> Enable sybil protection
            </div>

            <BaseListboxMultiple
              v-model="selectedSybilItems"
              :items="sybilItems"
              :disable-input="!isSybil"
            >
              <template #item="{ item }">
                <span>{{
                  item.name === 'poh' ? 'Proof of humanity' : 'BrightID'
                }}</span>
              </template>
              <template #selected="{ selectedItems }">
                <span>
                  {{
                    selectedItems
                      .map(item =>
                        item.name === 'poh' ? 'Proof of humanity' : 'BrightID'
                      )
                      .join(', ')
                  }}
                </span>
              </template>
            </BaseListboxMultiple>
          </div>
        </div>
        <div>
          <LabelInput>Token info</LabelInput>
          <div class="inline-block rounded-xl border p-2 px-3">
            <div class="flex w-[200px] justify-between">
              Type <span class="text-skin-link">{{ token?.type || '-' }}</span>
            </div>
            <div class="flex w-[200px] justify-between">
              Name <span class="text-skin-link">{{ token?.name || '-' }}</span>
            </div>
            <div class="flex w-[200px] justify-between">
              Symbol
              <span class="text-skin-link">{{ token?.symbol || '-' }}</span>
            </div>
            <div class="flex w-[200px] justify-between">
              Decimals
              <span class="text-skin-link">{{ token?.decimals || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </BaseBlock>

    <BaseBlock> Demo: {{ strategy }} </BaseBlock>

    <BaseButton class="float-right" primary @click="nextStep">
      {{ strategy?.name ? 'Next' : 'Skip' }}
    </BaseButton>
  </div>
</template>
