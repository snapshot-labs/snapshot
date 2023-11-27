<script setup lang="ts">
type ConnextTransactionProps = {
  modelValue: SafeTransaction[];
  config: SafeTransactionConfig;
  isDetails: boolean;
  nonce: number;
};

import { ref, computed, watch, watchEffect, nextTick } from 'vue';
import {
  MAINNET_DOMAIN_IDS,
  TEST_DOMAIN_IDS,
  rawToModuleTransaction,
  getContractTransactionData,
  getContractABI,
  contractInteractionToModuleTransaction,
  createBatch,
  getNativeAsset
} from '../../index';
import { Network } from '../../constants';
import SafeSnapTokensModal from './TokensModal.vue';
import SafeSnapInputAddress from '../Input/Address.vue';
import SafeSnapInputAmount from '../Input/Amount.vue';
import Plugin from '../../index';
import { FunctionFragment } from '@ethersproject/abi';
import {
  SafeTransaction,
  SafeTransactionConfig,
  SimulationState,
  TokenAsset
} from '@/helpers/interfaces';
import { ETH_CONTRACT } from '@/helpers/constants';
import { shorten } from '@/helpers/utils';
import { formatUnits } from '@ethersproject/units';
import SafeSnapSimulationTenderly from '../Simulation/Tenderly.vue';

const props = defineProps<ConnextTransactionProps>();
const emit = defineEmits(['update:modelValue']);
const plugin = new Plugin();

const getInvertedNetworkMap = (): { [key: string]: string } => {
  return Object.entries(Network)
    .filter(([, value]) => typeof value === 'string')
    .reduce((invertedMap, [key, value]) => {
      invertedMap[value as string] = key;
      return invertedMap;
    }, {} as { [key: string]: string });
};

const getNetworkKeyByDomainId = (domainId: number): string | undefined => {
  const combinedDomainIds = { ...MAINNET_DOMAIN_IDS, ...TEST_DOMAIN_IDS };
  const networkEntry = Object.entries(Network).find(([key, value]) => {
    return (
      combinedDomainIds[value as keyof typeof combinedDomainIds] === domainId
    );
  });

  return networkEntry ? networkEntry[0] : undefined;
};

const setTokens = () => {
  if (props.config.tokens) {
    tokens.value = [
      // getNativeAsset(props.config.network),
      ...props.config.tokens
    ];
  }
};

const setInitialModelValue = async (modelValue: SafeTransaction[]) => {
  if (modelValue && modelValue?.length) {
    const transactions = modelValue;

    transactions.forEach(async tx => {
      if (tx.type === 'raw') {
        simulation.value = tx.simulation;
        const transaction = await plugin.decodeConnextXcallData(tx.data);
        selectedNetwork.value = transaction[0];
        destinationAddress.value = transaction[1];
        tokenAddress.value = transaction[2];
        // Use nextTick to ensure reactivity updates are processed
        await nextTick(() => {
          amount.value = transaction[4].toString();
        });
      }
    });
  }
};

const selectedToken = computed(() => {
  if (tokens.value?.length) {
    return tokens.value.find(
      (token: TokenAsset) => token.address === tokenAddress.value
    );
  }
  return undefined;
});

const handleNetworkChange = (network: string) => {
  selectedNetwork.value = network;
};

const handleInput = (
  value: string,
  field: 'tokenAddress' | 'destinationAddress' | 'amount'
) => {
  if (field === 'tokenAddress') {
    return (tokenAddress.value = value);
  }
  if (field === 'destinationAddress') {
    return (destinationAddress.value = value);
  }
  if (field === 'amount') {
    amount.value = value;
  }
};

const createConnextBatch = (nonce: number, txs: SafeTransaction[]) => {
  const chainId = parseInt(props.config.network);
  return createBatch(
    props.config.realityAddress,
    chainId,
    nonce,
    txs,
    props.config.multiSendAddress
  );
};

const generateApproveTransaction = async (connext: string, amount: string) => {
  const result = await getContractABI(props.config.network, tokenAddress.value);

  if (result) {
    const abi = JSON.parse(result);
    const approveIndex = abi.findIndex(
      item => item.name === 'approve' && item.type === 'function'
    );

    // Convert the JSON ABI method into a FunctionFragment
    const methodFragment = FunctionFragment.from(abi[approveIndex]);

    const data = getContractTransactionData(abi, methodFragment, [
      connext,
      amount
    ]);

    const transaction = contractInteractionToModuleTransaction(
      {
        data,
        to: tokenAddress.value,
        value: '0',
        nonce: props.nonce.toString(),
        method: methodFragment
      },
      props.config.multiSendAddress
    );
    if (plugin.validateTransaction(transaction)) {
      transaction.transactionBatchType = 'connext';
      return transaction;
    }
  }
};

const generateConnextTransaction = async (connext: string) => {
  const txData = await plugin.generateConnextXcallData({
    network: props.config.network,
    connext,
    tokenAddress: tokenAddress.value,
    destinationAddress: destinationAddress.value,
    amount: amount.value,
    domainId: selectedNetwork.value
  });
  let transaction = rawToModuleTransaction({
    value: '0',
    to: connext,
    data: txData,
    nonce: (props.nonce + 1).toString()
  });
  transaction.type = 'raw';
  if (plugin.validateTransaction(transaction)) {
    transaction.transactionBatchType = 'connext';
    return transaction;
  }
};

const submitConnextTransaction = async () => {
  const connextModule = await plugin.getConnextModule(
    props.config.network,
    props.config.connextAddress
  );
  const connext = await connextModule.connext();
  const approveTransaction = await generateApproveTransaction(
    connext,
    amount.value
  );
  const connextTransaction = await generateConnextTransaction(connext);

  if (approveTransaction && connextTransaction) {
    const batch = createConnextBatch(0, [
      approveTransaction,
      connextTransaction
    ]);
    return batch;
  }
};

const updateTransaction = async () => {
  if (props.config.preview) return;
  try {
    const txs = await submitConnextTransaction();
    if (txs?.transactions) {
      return emit('update:modelValue', txs.transactions);
    }
  } catch (error) {
    console.warn('invalid transaction');
  }
  emit('update:modelValue', undefined);
};

const openModal = () => {
  if (!props.config.tokens.length) return;
  modalTokensOpen.value = true;
};

const format = (amount: string, decimals: number) => {
  try {
    return formatUnits(amount, decimals).toString();
  } catch (error) {
    return undefined;
  }
};

const simulation = ref<SimulationState | undefined>(undefined);
const isEditing = ref<boolean>(false);
const tokens = ref<TokenAsset[]>();
const modalTokensOpen = ref<boolean>(false);
const selectedNetwork = ref<string>('');
const tokenAddress = ref<string>('main');
const destinationAddress = ref<string>('');
const amount = ref<string>('0');
const chainList = ref<{ [key: string]: string }>(getInvertedNetworkMap());

const isMainnet = computed(() =>
  Object.keys(MAINNET_DOMAIN_IDS).includes(props.config.network)
);
const isTestnet = computed(() =>
  Object.keys(TEST_DOMAIN_IDS).includes(props.config.network)
);

watch(() => props.config, setTokens, { immediate: true });

watch(
  () => props.modelValue,
  async newVal => {
    if (newVal && newVal.length) {
      isEditing.value = true;
      await setInitialModelValue(newVal);
    } else {
      isEditing.value = false;
    }
  },
  { immediate: true }
);

watchEffect(async () => {
  if (
    tokenAddress.value &&
    destinationAddress.value &&
    amount.value &&
    selectedNetwork.value
  ) {
    await updateTransaction();
  }
});
</script>

<template>
  <div v-if="isDetails" class="mb-2 flex flex-col space-y-2 px-3">
    <div class="flex space-x-2">
      <span class="text-skin-text">{{ $t('safeSnap.asset') }}</span>
      <AvatarToken
        :address="
          selectedToken
            ? selectedToken.address === 'main'
              ? ETH_CONTRACT
              : selectedToken.address
            : ''
        "
        class="ml-2"
      />
      <span v-if="selectedToken">{{ selectedToken.symbol }}</span>
      <span>
        {{
          selectedToken
            ? selectedToken.address === 'main'
              ? ''
              : `(${shorten(selectedToken.address)})`
            : ''
        }}
      </span>
    </div>
    <div class="flex space-x-2">
      <p class="text-skin-text">{{ $t('safeSnap.amount') }}</p>
      <p>{{ selectedToken && format(amount, selectedToken.decimals) }}</p>
    </div>
    <div class="flex space-x-2">
      <p class="text-skin-text">Destination Chain</p>
      <p>
        {{
          selectedNetwork && getNetworkKeyByDomainId(parseInt(selectedNetwork))
        }}
      </p>
    </div>
    <div class="flex space-x-2">
      <p class="text-skin-text">Destination Address</p>
      <p>
        {{ shorten(destinationAddress) }}
      </p>
    </div>
    <SafeSnapSimulationTenderly
      v-if="simulation"
      :is-details="props.isDetails"
      :model-value-to-simulate="modelValue"
      :config="props.config"
      :run-simulation="false"
      :default-simulation-result="simulation"
    />
  </div>
  <div v-if="!isDetails">
    <p class="mb-3 font-normal text-skin-heading sm:px-2 md:px-0">
      Add Connext Transaction
    </p>
    <div class="mt-2 space-y-2">
      <BaseButton
        class="safesnap-custom-select mb-2 flex w-full flex-row items-center justify-between !px-3"
        @click="openModal()"
      >
        <div class="flex flex-row space-x-2">
          <span class="text-skin-text">{{ $t('safeSnap.asset') }}</span>
          <AvatarToken
            :address="
              selectedToken
                ? selectedToken.address === 'main'
                  ? ETH_CONTRACT
                  : selectedToken.address
                : ''
            "
            class="ml-2"
          />
          <span v-if="selectedToken">{{ selectedToken.symbol }}</span>
          <span>
            {{
              selectedToken
                ? selectedToken.address === 'main'
                  ? ''
                  : `(${shorten(selectedToken.address)})`
                : ''
            }}
          </span>
        </div>
        <i-ho-chevron-down class="text-xs text-skin-link" />
      </BaseButton>
      <SafeSnapInputAmount
        :label="$t('safeSnap.amount')"
        :decimals="selectedToken?.decimals"
        :model-value="amount"
        :disabled="props.config.preview"
        @update:modelValue="handleInput($event, 'amount')"
      />
      <UiSelect
        :custom-styles="'safesnap-custom-select'"
        v-if="isMainnet"
        :model-value="selectedNetwork"
        :disabled="props.config.preview"
        @update:modelValue="handleNetworkChange($event)"
      >
        <template #label>Destination Chain</template>
        <option
          v-for="(domainId, network) in MAINNET_DOMAIN_IDS"
          :key="network"
          :value="domainId"
        >
          {{ chainList[network] }}
        </option>
      </UiSelect>

      <!-- Testnet Dropdown -->
      <UiSelect
        :custom-styles="'safesnap-custom-select'"
        v-if="isTestnet"
        :model-value="selectedNetwork"
        @update:modelValue="handleNetworkChange($event)"
      >
        <template #label>Destination Chain</template>
        <option
          v-for="(domainId, network) in TEST_DOMAIN_IDS"
          :key="network"
          :value="domainId"
        >
          {{ chainList[network] }}
        </option>
      </UiSelect>

      <SafeSnapInputAddress
        :input-props="{
          required: true
        }"
        :label="`Destination Address`"
        :disabled="props.config.preview"
        :model-value="destinationAddress"
        @validAddress="handleInput($event, 'destinationAddress')"
      />


      <teleport to="#modal">
        <SafeSnapTokensModal
          v-if="tokens?.length"
          :tokens="tokens"
          :token-address="tokenAddress"
          :open="modalTokensOpen"
          :network="config.network"
          @token-address="tokenAddress = $event"
          @close="modalTokensOpen = false"
        />
      </teleport>
    </div>
  </div>
</template>

<style scoped>
.collapsible-text {
  border-radius: 23px;
}
</style>
