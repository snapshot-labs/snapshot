<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import SafeSnapInputAddress from '../Input/Address.vue';
import { getIpfsUrl, shorten } from '@/helpers/utils';

import { Network } from '../../types';
import {
  findChainKeyById,
  getAssetsByChainId,
  getConstants
} from '../../index';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import SafeSnapInputAmount from '../Input/Amount.vue';
import SafeSnapSimulationTenderly from '../Simulation/Tenderly.vue';
import {
  CustomConnextTransaction,
  SafeTransactionConfig
} from '@/helpers/interfaces';
export interface ConnextFormProps {
  network: Network;
  loading: boolean;
  config: SafeTransactionConfig;
  destinationAddress: string;
  destinationChain: string;
  contractAddress: string;
  assetAddress: string;
  amount: number;
  isDetails: boolean;
  preview: boolean;

  modelValue: CustomConnextTransaction;
}
const props = defineProps<ConnextFormProps>();
const emit = defineEmits(['update:modelValue']);

const isMainnet = computed(() => {
  const { MAINNET_CHAINS } = getConstants();
  return MAINNET_CHAINS.includes(props.network);
});

const assetsList = computed(() => {
  const { Chains } = getConstants();
  const assets = getAssetsByChainId(Chains, parseInt(props.network));
  if (assets) {
    const list = Object.entries(assets).map(([key, value]) => ({
      name: key,
      value: value
    }));
    return list;
  }
  return [];
});

const tokenDecimal = computed(() => {
  const { tokensDecimals } = getConstants();

  if (
    (props.assetAddress || props.modelValue.approveTx.to) &&
    (props.destinationChain || props.modelValue.destinationChain)
  ) {
    const token = assetsList.value.find(asset => {
      if (
        asset.value === (props.assetAddress || props.modelValue.approveTx.to)
      ) {
        return asset.name;
      }
    });

    if (token) {
      return tokensDecimals[token.name];
    }
  }
});

console.log('tokenDecimal', tokenDecimal);
const destinationChainList = computed(() => {
  const {
    Chains,
    AVAILABLE_DESTINY_NETWORKS,
    AVAILABLE_ORIGIN_NETWORKS,
    TESTNET_AVAILABLE_ORIGIN_NETWORKS,
    TESTNET_AVAILABLE_DESTINY_NETWORKS
  } = getConstants();
  const key = findChainKeyById(Chains, parseInt(props.network));

  if (isMainnet.value && AVAILABLE_ORIGIN_NETWORKS.includes(key ?? '')) {
    return AVAILABLE_DESTINY_NETWORKS.filter(network => network !== key).map(
      network => {
        return {
          name: Chains[network].name,
          value: Chains[network].id.toString()
        };
      }
    );
  }

  if (
    !isMainnet.value &&
    TESTNET_AVAILABLE_ORIGIN_NETWORKS.includes(key ?? '')
  ) {
    return TESTNET_AVAILABLE_DESTINY_NETWORKS.filter(
      network => network !== key
    ).map(network => {
      return {
        name: Chains[network].name,
        value: Chains[network].id.toString()
      };
    });
  }
  return [];
});

const networkIcon = (network: string) => {
  const { logo } = networks[network];
  return getIpfsUrl(logo);
};

const networkName = (network: string) => {
  if (network === '1') return 'Mainnet';
  const { name } = networks[network] || {};
  return name || `#${network}`;
};
</script>

<template>
  <div
    v-if="
      props.isDetails &&
      props.modelValue &&
      props.modelValue.originTx &&
      props.modelValue.originTx.calldatas.length
    "
    class="grid gap-y-3 grid-cols-1 mt-3 px-3"
  >
    <div class="flex space-x-2">
      <p>Origin chain:</p>
      <BaseAvatar
        class="float-left"
        :src="networkIcon(props.network)"
        size="28"
      />
      <p>
        {{ networkName(props.network) }}
      </p>
    </div>
    <div class="flex space-x-2">
      <p>Destination chain:</p>
      <BaseAvatar
        class="float-left"
        :src="networkIcon(props.modelValue.destinationChain)"
        size="28"
      />
      <p>
        {{ networkName(props.modelValue.destinationChain) }}
      </p>
    </div>
    <p>
      Destination Address:
      {{ shorten(props.modelValue.originTx.calldatas[1].value) }}
    </p>
    <p>Asset Address: {{ shorten(props.modelValue.approveTx.to) }}</p>
    <div :class="'flex space-x-1'">
      <p>Amount:</p>
      <SafeSnapInputAmount
        v-if="
          props.modelValue.approveTx.to &&
          tokenDecimal &&
          props.modelValue.amount
        "
        :is-details="true"
        :decimals="tokenDecimal"
        :model-value="props.modelValue.amount"
      />
    </div>

    <SafeSnapSimulationTenderly
      v-if="props.modelValue.simulation"
      :is-details="props.isDetails"
      :model-value-to-simulate="props.modelValue"
      :config="props.config"
      :run-simulation="false"
      :default-simulation-result="props.modelValue.simulation"
    />
  </div>

  <div v-if="!props.isDetails" class="grid gap-y-3 grid-cols-1 mt-3">
    <div class="grid gap-y-3 grid-cols-1 mt-3">
      <div class="flex space-x-2">
        <p>Origin chain:</p>
        <BaseAvatar
          class="float-left"
          :src="networkIcon(props.network)"
          size="28"
        />
        <p>
          {{ networkName(props.network) }}
        </p>
      </div>
      <TuneListbox
        :disabled="props.loading"
        :model-value="props.destinationChain"
        :items="destinationChainList"
        :label="'Destination Chain'"
        @update:model-value="
          value =>
            emit('update:modelValue', {
              field: 'destinationChain',
              value: value
            })
        "
      />

      <TuneListbox
        :disabled="props.loading"
        :model-value="props.assetAddress"
        :items="assetsList"
        :label="'Asset'"
        @update:model-value="
          value =>
            emit('update:modelValue', {
              field: 'assetAddress',
              value: value
            })
        "
      />

      <hr
        v-if="!props.isDetails && props.destinationChain"
        class="border-skin-border"
      />

      <SafeSnapInputAddress
        v-model="props.destinationAddress"
        :disabled="props.preview"
        :input-props="{
          required: true
        }"
        :label="'Destination Address'"
        @valid-address="
          address =>
            emit('update:modelValue', {
              field: 'destinationAddress',
              value: address
            })
        "
      />
      <SafeSnapInputAmount
        v-if="assetAddress && tokenDecimal"
        :label="$t('safeSnap.amount')"
        :decimals="tokenDecimal"
        :model-value="props.amount"
        :disabled="props.preview"
        @update:modelValue="
          amount =>
            emit('update:modelValue', {
              field: 'amount',
              value: amount
            })
        "
      />
    </div>

    <div v-if="props.loading" class="flex space-x-2">
      <LoadingSpinner class="pb-[3px]" />
      <p class="text-[12px]">Encoding connext transaction</p>
    </div>
  </div>
</template>
