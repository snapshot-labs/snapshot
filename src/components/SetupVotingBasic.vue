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

// const isMultiplier = ref(false);

const token = ref(null);

const strategyName = computed(() => {
  if (token.value?.type === 'ERC-20') {
    return 'erc20-balance-of';
  }
  if (token.value?.type === 'ERC-721') {
    return 'erc721';
  } else return '';
});

const strategy = computed(() => {
  const obj = {
    name: strategyName.value,
    network: input.value.network,
    params: {
      network: input.value.network,
      address: input.value.address,
      decimals: token.value?.decimals
    }
  };
  if (token.value?.type !== 'ERC-20') {
    delete obj.params.decimals;
  }
  const sybilObj = {
    name: 'sybil-protection',
    params: {
      strategy: obj,
      sybil: {
        poh: '0xC5E9dDebb09Cd64DfaCab4011A0D5cEDaf7c9BDb',
        brightId: 'v5'
      }
    }
  };
  sybilItems.value.forEach(item => {
    // if poh or brightId isn't selected delete it from the sybil obj
    if (!selectedSybilItems.value.find(i => i.id === item.id)) {
      delete sybilObj.params.sybil[item.name];
    }
  });
  return isSybil.value ? sybilObj : obj;
});

function nextStep() {
  emit('next');
  form.value.strategies = [];
  form.value.strategies.push(strategy.value);
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
  <div class="space-y-4">
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
            <div class="flex">
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
          <!-- <div>
            <div class="flex">
              <BaseSwitch v-model="isMultiplier" /> Enable multiplier
            </div>
            <BaseInput
              class="mt-1"
              :class="{
                'cursor-not-allowed placeholder:text-skin-border': !isMultiplier
              }"
              :disabled="!isMultiplier"
              placeholder="Enter multiplier"
            />
          </div> -->
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

    <BaseButton class="float-right" primary @click="nextStep">
      {{ strategy.name ? 'Next' : 'Skip' }}
    </BaseButton>
  </div>
</template>
