<script lang="ts" setup>
import pick from 'lodash/pick';
import { ExtendedSpace } from '@/helpers/interfaces';
import { validateForm } from '@/helpers/validation';
import { getSnapshotFee, MINT_CURRENCY } from '@/helpers/nftClaimer';

const props = defineProps<{
  context: string;
  space: ExtendedSpace;
}>();

const { web3Account } = useWeb3();
const { deploy, update, loading, toggleMintStatus } = useNFTClaimer(
  props.space
);
const { getContractInfo, init, inited } = useNFTClaimerStorage();

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

function toggleStatus() {
  toggleMintStatus(!contractInfo.value.enabled);
}

function resetForm() {
  input.value = pick(contractInfo.value, [
    'maxSupply',
    'formattedMintPrice',
    'proposerFee',
    'treasuryAddress'
  ]);
}

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
  <LoadingRow v-if="!inited" block />
  <template v-else>
    <BaseMessageBlock
      v-if="!isSpaceController"
      class="md:mx-0"
      level="info"
      is-responsive
    >
      You are in view only mode, to modify space settings connect with a
      controller wallet.
    </BaseMessageBlock>
    <BaseBlock v-if="contractInfo" class="mb-2 mt-3" title="Mint status">
      <div class="flex gap-x-4">
        <div class="grow">
          <p>
            At any time, you can disable/enable the minting status of this
            space. Disabling will only prevent minting of future NFTs, and does
            not affect existing tokens.
          </p>
        </div>
        <div>
          <BaseButton
            class="whitespace-nowrap"
            :variant="contractInfo.enabled ? 'danger' : undefined"
            :disabled="isViewOnly"
            @click="toggleStatus()"
          >
            {{ contractInfo.enabled ? 'Disable' : 'Enable' }} minting
          </BaseButton>
        </div>
      </div>
    </BaseBlock>
    <form class="flex flex-col gap-y-3">
      <BaseBlock title="SnapIt!">
        <div class="flex w-full flex-col gap-y-3">
          <BaseMessage level="info" class="mb-3">
            Updates will only be applied to future proposals
          </BaseMessage>
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
            @update:model-value="
              value => (input.formattedMintPrice = Number(value))
            "
          />

          <TuneInput
            v-model="input.proposerFee"
            label="Proposer fees"
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
      </BaseBlock>

      <div v-if="!contractInfo" class="flex gap-5 px-4 pt-2 md:px-0">
        <BaseButton
          primary
          class="w-full"
          :disabled="isViewOnly"
          :loading="loading"
          type="submit"
          @click="submit"
        >
          Setup SnapIt!
        </BaseButton>
      </div>
      <div v-else class="flex gap-5 px-4 pt-2 md:px-0">
        <BaseButton
          class="mb-2 block w-full"
          :disabled="isViewOnly"
          @click="resetForm"
        >
          {{ $t('reset') }}
        </BaseButton>
        <BaseButton
          primary
          class="block w-full"
          type="submit"
          :disabled="isViewOnly || !isValid"
          :loading="loading"
          @click="submit"
        >
          Save
        </BaseButton>
      </div>
    </form>
  </template>
</template>
