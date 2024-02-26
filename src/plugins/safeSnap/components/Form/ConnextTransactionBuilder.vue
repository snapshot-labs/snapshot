<script setup lang="ts">
type ConnextTransactionProps = {
  modelValue: CustomConnextTransaction;
  config: SafeTransactionConfig;
  isDetails: boolean;
  nonce: number;
};

import { ref, computed, defineEmits } from 'vue';
import {
  CustomConnextTransaction,
  SafeDetails,
  SafeTransactionConfig
} from '@/helpers/interfaces';
import { useStorage } from '@vueuse/core';
import Plugin, { findChainKeyById, getConstants } from '../../index';
import { ConnextModDetails } from '../../types/connext';
import { getABIWriteFunctions, getContractABI } from '../../utils/abi';
import { Fragment, FunctionFragment } from '@ethersproject/abi';
import ConnextZodiacModForm from '../Connext/ConnextZodiacModForm.vue';
import ConnextForm from '../Connext/ConnextForm.vue';
import {
  generateConnextTransaction,
  getChainIdByDomainId,
  encodeDestinationTx,
  prepareETHBridgeTransaction,
  prepareERC20BridgeTransaction
} from '../../utils/connextModule';
import { debounce } from 'lodash';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';

const plugin = new Plugin();

const isConnextAvailable = computed(() => {
  const { Chains, AVAILABLE_ORIGIN_NETWORKS } = getConstants();
  const originChain = findChainKeyById(Chains, parseInt(props.config.network));
  if (!originChain) return false;
  return AVAILABLE_ORIGIN_NETWORKS.includes(originChain);
});
console.log('isConnextAvailable', isConnextAvailable);

const props = defineProps<ConnextTransactionProps>();
const emit = defineEmits(['update:modelValue', 'clearParams']);
const safeList = useStorage<SafeDetails[]>('snapshot.safeList', []);
const generateTxLoading = ref<boolean>(false);
const zodiacConnextMod = ref<boolean>(false);
const connextModList = ref<ConnextModDetails[]>([]);
const destinationSafe = ref<string>('');
const destinationAddress = ref<string>('');
const destinationSafeChain = ref<string>('');
const destinationChain = ref<string>('');
const contractAddress = ref<string>('');
const assetAddress = ref<string>('');
const abi = ref<Fragment[]>([]);
const methodIndex = ref<number>(0);
const methods = ref<FunctionFragment[]>([]);
const validAbi = ref<boolean>(false);
const parameters = ref<string[]>([]);
const amount = ref<number>(0);
const selectedMethod = ref();

const debouncedValidation = debounce(() => {
  if (allZodiacModFieldsCompleted()) {
    submit();
  }
}, 500);

const ASSET_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)'
];

const CONNEXT_ABI = [
  {
    inputs: [
      {
        internalType: 'uint32',
        name: '_destination',
        type: 'uint32'
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_asset',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_delegate',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_slippage',
        type: 'uint256'
      },
      {
        internalType: 'bytes',
        name: '_callData',
        type: 'bytes'
      },
      {
        internalType: 'uint256',
        name: '_relayerFee',
        type: 'uint256'
      }
    ],
    name: 'xcall',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

async function initialize() {
  if (props.modelValue && safeList.value.length) {
    await loadTransactionDetails(props.modelValue);
  }
  await loadConnextModDetails();
}

async function loadTransactionDetails(modelValue: CustomConnextTransaction) {
  const { originTx, destinationTx } = modelValue;
  if (!destinationTx || !originTx) return;
  contractAddress.value = destinationTx.to;
  const domainId = originTx.calldatas[0].value;
  const zodiacConnextModAddress = originTx.calldatas[1].value;
  const chainId = getChainIdByDomainId(domainId) ?? '';
  destinationSafeChain.value = chainId.toString();
  try {
    const result = await getContractABI(chainId.toString(), destinationTx.to);
    abi.value = JSON.parse(result);
    handleABIChanged(abi.value);
    setDestinationSafe(zodiacConnextModAddress, destinationTx.to);
    parameters.value = destinationTx.calldatas.map(param => param.value);
  } catch (error) {
    console.error('Error fetching contract ABI:', error);
  }
}

function setDestinationSafe(
  zodiacConnextModAddress: string,
  destinationAddress: string
) {
  const defaultDestinationSafe = safeList.value.find(
    safe => safe.connextAddress === zodiacConnextModAddress
  );

  if (defaultDestinationSafe?.gnosisSafeAddress) {
    zodiacConnextMod.value = true;
    destinationSafe.value = defaultDestinationSafe.gnosisSafeAddress;
  } else {
    destinationSafe.value = destinationAddress;
  }
}

async function loadConnextModDetails() {
  const relevantSafes = safeList.value.filter(
    safe =>
      props.config.gnosisSafeAddress !== safe.gnosisSafeAddress &&
      safe.connextAddress
  );

  try {
    const details = await Promise.all(
      relevantSafes.map(fetchConnextModDetails)
    );
    connextModList.value = details.filter(
      (detail): detail is ConnextModDetails => detail !== undefined
    );
  } catch (error) {
    console.error('Error fetching Connext module details:', error);
  }
}
onMounted(initialize);

onUnmounted(() => {
  debouncedValidation.cancel();
});

watch(
  [connextModList, safeList, abi, methods, parameters, contractAddress],
  () => {
    debouncedValidation();
  },
  { deep: true }
);

watch(
  [amount],
  () => {
    allConnextCompleted();
  },
  { deep: true }
);

const allZodiacModFieldsCompleted = () => {
  const selectedMethodInputs = methods.value[methodIndex.value]?.inputs || [];

  const parametersCompleted =
    selectedMethodInputs.length === parameters.value.length &&
    parameters.value.every(parameter => parameter !== '');

  return (
    connextModList.value.length > 0 &&
    safeList.value.length > 0 &&
    abi.value.length > 0 &&
    methods.value.length > 0 &&
    parametersCompleted &&
    contractAddress.value !== ''
  );
};
const allConnextCompleted = () => {
  console.log('amount.value', amount.value);
};

const fetchConnextModDetails = async (
  safe: SafeDetails
): Promise<ConnextModDetails | undefined> => {
  const details = await plugin.getModuleDetailsConnext(
    safe.network,
    safe.connextAddress as string
  );
  if (details?.originSender === props.config.gnosisSafeAddress) {
    return { ...details, network: safe.network };
  }
  return undefined;
};

const handleMethodChanged = () => {
  parameters.value = [];
  selectedMethod.value = methods.value[methodIndex.value];
  emit('clearParams');
};

const handleParameterChanged = (index: number, value: string) => {
  const params = parameters.value;
  params[index] = value;
  emit('clearParams');
};

const handleABIChanged = (value: Fragment[]) => {
  methodIndex.value = 0;
  methods.value = [];
  try {
    methods.value = getABIWriteFunctions(abi.value);
    validAbi.value = true;
    handleMethodChanged();
  } catch (error) {
    validAbi.value = false;
    console.warn('error extracting useful methods', error);
  }
};

const updateField = async (
  field:
    | 'contractAddress'
    | 'destinationAddress'
    | 'destinationSafe'
    | 'destinationChain'
    | 'assetAddress'
    | 'amount',
  value: string
) => {
  switch (field) {
    case 'amount':
      amount.value = parseInt(value);
      break;
    case 'assetAddress':
      assetAddress.value = value;
      break;
    case 'destinationChain':
      destinationChain.value = value;
      break;
    case 'destinationAddress':
      destinationAddress.value = value;
      break;
    case 'destinationSafe':
      destinationSafe.value = value;
      break;
    case 'contractAddress':
      contractAddress.value = value;
      console.log('connextModList.value', connextModList.value);
      if (connextModList.value.length) {
        const { network } = connextModList.value.filter(safe => {
          if (safe.dao === destinationSafe.value) return safe;
        })[0];

        const result = await getContractABI(
          network ?? '',
          contractAddress.value
        );
        console.log('result', JSON.parse(result) as Fragment[]);
        abi.value = JSON.parse(result) as Fragment[];
        handleABIChanged(abi.value);
      }
      break;
  }
};

const submit = async () => {
  const simpleConnextTx = prepareERC20BridgeTransaction({
    tokenAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    amount: '100',
    recipient: '0x2a438dB1D761c33a0179FfC23D2bF7282B8bCb55',
    destinationDomain: 6778479, // Gnosis Chain domainId
    slippage: 300,
    relayerFee: '4000',
    signerAddress: '0x89e5F188F17AD9d7Ba4b54ABE7Bce5c9FEFBb348',
    nonce: props.nonce
  });
  const connextTx: CustomConnextTransaction = {
    type: 'connext',
    simpleTransaction: simpleConnextTx,
    abi: [],
    destinationTx: undefined,
    originTx: undefined,
    destinationChain: '100',
    zodiacMod: '',
    to: '',
    value: '',
    data: '',
    operation: '',
    nonce: ''
  };
  emit('update:modelValue', connextTx);

  // allConnextCompleted();

  // if ((zodiacConnextMod && !allZodiacModFieldsCompleted()) || props.isDetails) {
  //   generateTxLoading.value = false;
  //   return;
  // }

  // generateTxLoading.value = true;
  // const destinationChain = connextModList.value.find(
  //   safe => safe.dao === destinationSafe.value
  // );
  // const destinationSafeSelected = safeList.value.find(safe => {
  //   if (safe.gnosisSafeAddress === destinationSafe.value) {
  //     return safe.connextAddress;
  //   }
  // });

  // if (destinationChain && destinationSafeSelected) {
  //   const connextTx = await generateConnextTransaction({
  //     destinationChain: {},
  //     destinationSafeSelected,
  //     abi: abi.value,
  //     method: methods.value[methodIndex.value],
  //     parameters: parameters.value,
  //     contractAddress: contractAddress.value,
  //     originSafeAddress: props.config.gnosisSafeAddress,
  //     originChain: props.config.network,
  //     nonce: props.nonce
  //   });
  //   if (connextTx) {
  //     emit('update:modelValue', connextTx);
  //   }
  //   console.log('Submit the following tx:', connextTx);
  // }
  // generateTxLoading.value = false;
};
</script>

<template>
  <template v-if="!isConnextAvailable">
    <ConnextChainAvailability :network="props.config.network" />
  </template>
  <template v-else>
    <TuneSwitch
      :class="`${props.isDetails ? 'px-3' : ''} `"
      :disabled="props.isDetails || generateTxLoading"
      :model-value="zodiacConnextMod"
      label="Use a Zodiac Connext Module"
      @update:model-value="() => (zodiacConnextMod = !zodiacConnextMod)"
    />

    <template v-if="zodiacConnextMod">
      <ConnextZodiacModForm
        :loading="generateTxLoading"
        :config="props.config"
        :destination-safe="destinationSafe"
        :contract-address="contractAddress"
        :connext-mod-list="connextModList"
        :is-details="props.isDetails"
        :preview="props.config.preview"
        :methods="methods"
        :method-index="methodIndex"
        :parameters="parameters"
        :selected-method="selectedMethod"
        :destination-safe-chain="destinationSafeChain"
        :model-value="props.modelValue"
        :relayer-fee="props.modelValue.value"
        @update:method-change="handleMethodChanged"
        @update:model-value="({ field, value }) => updateField(field, value)"
        @update:parameter-change="
          ({ index, value }) => handleParameterChanged(index, value)
        "
      />
    </template>

    <template v-if="!zodiacConnextMod">
      <ConnextForm
        :amount="amount"
        :assetAddress="assetAddress"
        :network="props.config.network"
        :loading="generateTxLoading"
        :destination-address="destinationAddress"
        :is-details="props.isDetails"
        :preview="props.config.preview"
        :destination-chain="destinationChain"
        :contract-address="contractAddress"
        @update:model-value="({ field, value }) => updateField(field, value)"
      />
      <button @click="submit">TEST</button>
    </template>
  </template>
</template>
