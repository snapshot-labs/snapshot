<script lang="ts" setup>
import pick from 'lodash/pick';
import { ExtendedSpace } from '@/helpers/interfaces';
import { validateForm } from '@/helpers/validation';
import { getSnapshotFee, MINT_CURRENCY } from '@/helpers/nftClaimer';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const emit = defineEmits(['startLoading', 'endLoading']);

const { web3Account } = useWeb3();
const { deploy, update, loading } = useNFTClaimer(props.space);
const { getContractInfo, init } = useNFTClaimerStorage();

const snapshotFee = ref(0);
// TODO Enable in production
// const { isSpaceController } = useSpaceController();
const isSpaceController = ref(true);

const maxProposerCut = computed(() => {
  return 100 - snapshotFee.value;
});

const schema = computed(() => {
  return {
    type: 'object',
    properties: {
      maxSupply: { type: 'integer', minimum: 1 },
      formattedMintPrice: { type: 'number', format: 'ethValue', minimum: 0 },
      proposerFee: {
        type: 'integer',
        minimum: 0,
        maximum: maxProposerCut.value
      },
      treasuryAddress: { type: 'string', format: 'address' }
    },
    required: [
      'maxSupply',
      'formattedMintPrice',
      'proposerFee',
      'treasuryAddress'
    ],
    additionalProperties: false
  };
});

const contractInfo = computed(() => {
  return getContractInfo(props.space.id);
});

const input = ref();

const validationErrors = computed(() => {
  return validateForm(schema.value, input.value);
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

const isViewOnly = computed(() => {
  return !isSpaceController.value || loading.value;
});

function submit() {
  if (!isValid.value) {
    return;
  }

  if (contractInfo.value?.address) {
    update(input.value);
  } else {
    deploy(input.value);
  }
}

function resetForm() {
  input.value = pick(contractInfo.value, [
    'maxSupply',
    'formattedMintPrice',
    'proposerFee',
    'treasuryAddress'
  ]);
}

defineExpose({ submit, resetForm, isValid });

watch(loading, newState => {
  newState ? emit('startLoading') : emit('endLoading');
});

watch(
  () => web3Account.value,
  () => {
    isSpaceController.value = !!web3Account.value;
  },
  { immediate: true }
);

watch(
  () => init(props.space),
  async () => {
    input.value = contractInfo.value
      ? pick(contractInfo.value, [
          'maxSupply',
          'formattedMintPrice',
          'proposerFee',
          'treasuryAddress'
        ])
      : {
          maxSupply: '',
          formattedMintPrice: '',
          proposerFee: '',
          treasuryAddress: ''
        };

    snapshotFee.value = await getSnapshotFee();
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex w-full flex-col gap-y-3">
    <TuneInput
      v-model="input.maxSupply"
      label="Max supply"
      hint="Maximum number of NFTs per proposal"
      placeholder="100"
      min="1"
      type="number"
      :disabled="isViewOnly"
      :error="validationErrors?.maxSupply"
      autofocus
      @update:model-value="value => (input.maxSupply = Number(value))"
    />

    <TuneInput
      v-model="input.formattedMintPrice"
      label="Mint price"
      :hint="`The mint price for each NFT, in ${MINT_CURRENCY}`"
      type="number"
      step="any"
      placeholder="0.5"
      :error="validationErrors?.formattedMintPrice"
      :disabled="isViewOnly"
      @update:model-value="value => (input.formattedMintPrice = Number(value))"
    />

    <TuneInput
      v-model="input.proposerFee"
      label="Proposer royalty fees"
      type="number"
      hint="Percentage of the mint price shared with the proposal author"
      placeholder="5"
      :max="maxProposerCut"
      :error="validationErrors?.proposerFee"
      :disabled="isViewOnly"
      @update:model-value="value => (input.proposerFee = Number(value))"
    />

    <TuneInput
      v-model.trim="input.treasuryAddress"
      label="Space treasury wallet"
      hint="Wallet address receiving the funds from the mint"
      placeholder="0x0000"
      :error="validationErrors?.treasuryAddress"
      :disabled="isViewOnly"
    />
  </div>
</template>
