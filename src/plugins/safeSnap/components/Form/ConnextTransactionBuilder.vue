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
  findAssetKeyByAddress,
  generateConnextTransaction,
  generateSimpleBridgeTransaction,
  getChainIdByDomainId
} from '../../utils/connextModule';
import { debounce } from 'lodash';

const plugin = new Plugin();

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

const isMainnet = computed(() => {
  if (props) {
    const { MAINNET_CHAINS } = getConstants();
    return MAINNET_CHAINS.includes(props.config.network);
  }
});

const isConnextAvailable = computed(() => {
  const {
    Chains,
    AVAILABLE_ORIGIN_NETWORKS,
    TESTNET_AVAILABLE_ORIGIN_NETWORKS
  } = getConstants();
  const originChain = findChainKeyById(Chains, parseInt(props.config.network));
  if (!originChain) return false;
  if (isMainnet.value) return AVAILABLE_ORIGIN_NETWORKS.includes(originChain);
  if (!isMainnet.value)
    return TESTNET_AVAILABLE_ORIGIN_NETWORKS.includes(originChain);
});

const debouncedValidation = debounce(() => {
  if (allZodiacModFieldsCompleted()) {
    submit('zodiac');
  }
}, 500);

const debouncedSimpleConnextValidation = debounce(() => {
  if (allConnextCompleted()) {
    submit('simple');
  }
}, 500);

const isNativeAsset = computed(() => {
  if (assetAddress.value) {
    const asset = findAssetKeyByAddress(assetAddress.value);
    return asset && asset.assetKey === 'WETH';
  }
  return false;
});

const initialize = async () => {
  if (props.modelValue && safeList.value.length) {
    if (
      !props.modelValue.approveTx &&
      props.modelValue.destinationTx &&
      props.modelValue.originTx
    ) {
      zodiacConnextMod.value = true;
      await loadZodiacConnextTransactionDetails(props.modelValue);
    }
  }
  if (props.modelValue && props.modelValue.approveTx) {
    loadSimpleConnextTransactionDetails(props.modelValue);
  }
  await loadConnextModDetails();
};

const loadZodiacConnextTransactionDetails = async (
  modelValue: CustomConnextTransaction
) => {
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
};

const loadSimpleConnextTransactionDetails = (
  modelValue: CustomConnextTransaction
) => {
  const { originTx, approveTx } = modelValue;
  if (!approveTx || !originTx) return;
  amount.value = modelValue.amount ?? 0;
  destinationChain.value = modelValue.destinationChain;
  assetAddress.value = approveTx.to;
  destinationAddress.value = originTx.calldatas[1].value;
};

const setDestinationSafe = (
  zodiacConnextModAddress: string,
  destinationAddress: string
) => {
  const defaultDestinationSafe = safeList.value.find(
    safe => safe.connextAddress === zodiacConnextModAddress
  );

  if (defaultDestinationSafe?.gnosisSafeAddress) {
    zodiacConnextMod.value = true;
    destinationSafe.value = defaultDestinationSafe.gnosisSafeAddress;
  } else {
    destinationSafe.value = destinationAddress;
  }
};

const loadConnextModDetails = async () => {
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
};

onMounted(initialize);

onUnmounted(() => {
  debouncedValidation.cancel();
  debouncedSimpleConnextValidation.cancel();
});

watch(
  [connextModList, safeList, abi, methods, parameters, contractAddress],
  () => {
    debouncedValidation();
  },
  { deep: true }
);

watch(
  [destinationChain, assetAddress, destinationAddress, amount],
  () => {
    debouncedSimpleConnextValidation();
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
  return (
    destinationAddress.value &&
    assetAddress.value &&
    destinationAddress.value &&
    amount.value >= 0
  );
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
      if (connextModList.value.length) {
        const { network } = connextModList.value.filter(safe => {
          if (safe.dao === destinationSafe.value) return safe;
        })[0];

        const result = await getContractABI(
          network ?? '',
          contractAddress.value
        );
        abi.value = JSON.parse(result) as Fragment[];
        handleABIChanged(abi.value);
      }
      break;
  }
};

const isValidateSimpleBridgeTransaction = () => {
  return zodiacConnextMod || allConnextCompleted();
};

const isValidateZodiacTransaction = () => {
  return zodiacConnextMod && allZodiacModFieldsCompleted();
};

const handleSimpleBridgeTransaction = () => {
  const simpleBridgeTx = generateSimpleBridgeTransaction(
    {
      originChainId: parseInt(props.config.network),
      assetAddress: assetAddress.value,
      amount: amount.value.toString(),
      destinationAddress: destinationAddress.value,
      destinationChainId: destinationChain.value,
      slippage: 300,
      relayerFee: '0',
      originSafeAddress: props.config.gnosisSafeAddress,
      nonce: props.nonce
    },
    isNativeAsset.value ?? false,
    props.config.multiSendAddress
  );
  console.log('simpleBridgeTx', simpleBridgeTx);
  return emit('update:modelValue', simpleBridgeTx);
};

const handleZodiacTransaction = async () => {
  const destinationChainZodiac = connextModList.value.find(
    safe => safe.dao === destinationSafe.value
  );
  const destinationSafeSelected = safeList.value.find(safe => {
    if (safe.gnosisSafeAddress === destinationSafe.value) {
      return safe.connextAddress;
    }
  });
  if (destinationChainZodiac && destinationSafeSelected) {
    const zodiacConnextModTx = await generateConnextTransaction({
      destinationChain: destinationChainZodiac,
      destinationSafeSelected,
      abi: abi.value,
      method: methods.value[methodIndex.value],
      parameters: parameters.value,
      contractAddress: contractAddress.value,
      originSafeAddress: props.config.gnosisSafeAddress,
      originChain: props.config.network,
      nonce: props.nonce
    });
    if (zodiacConnextModTx) {
      emit('update:modelValue', zodiacConnextModTx);
    }
    console.log('Submit the following tx:', zodiacConnextModTx);
  }
};

const submit = async (type: 'simple' | 'zodiac') => {
  if (
    props.isDetails ||
    (type === 'simple' && !isValidateSimpleBridgeTransaction()) ||
    (type === 'zodiac' && !isValidateZodiacTransaction())
  ) {
    generateTxLoading.value = false;
    return;
  }

  generateTxLoading.value = true;

  try {
    if (type === 'simple') {
      return handleSimpleBridgeTransaction();
    } else if (type === 'zodiac') {
      return await handleZodiacTransaction();
    }
  } catch (error) {
    console.error('Error handling transaction:', error);
  } finally {
    generateTxLoading.value = false;
  }
};
</script>

<template>
  <template v-if="isConnextAvailable">
    <TuneSwitch
      v-if="!props.isDetails"
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

    <template v-if="!zodiacConnextMod && !props.modelValue.destinationTx">
      <ConnextForm
        :config="props.config"
        :model-value="props.modelValue"
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
    </template>
  </template>
  <template v-else>
    <ConnextChainAvailability :network="props.config.network" />
  </template>
</template>
