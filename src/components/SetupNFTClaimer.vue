<script lang="ts" setup>
import { ExtendedSpace } from '@/helpers/interfaces';
import { validateForm } from '@/helpers/validation';
import pick from 'lodash/pick';
import { getSnapshotFee } from '@/helpers/nftClaimer';

const props = defineProps<{
  context: string;
  space: ExtendedSpace;
}>();
const emit = defineEmits(['back', 'next']);

const { forceShowError } = useFormSpaceSettings('setup');
const snapshotFee = ref(0);

const {
  deploy,
  update,
  spaceCollectionsInfo,
  loading,
  init,
  inited,
  mintCurrency,
  toggleMintStatus
} = useNFTClaimer(props.space);

const maxProposerCut = computed(() => {
  return 100 - snapshotFee.value;
});

const dirtyFields = ref(false);

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

const enabled = computed(() => {
  return spaceCollectionsInfo.value[props.space.id]?.enabled;
});

// TODO Enable in production
// const { isSpaceController } = useSpaceController();
const isSpaceController = true;

const isValidJson = ref(false);
const input = ref();

const validationErrors = computed(() => {
  dirtyFields.value =
    Object.values(input.value).toString() !==
    Object.values(
      pick(spaceCollectionsInfo.value[props.space.id], [
        'maxSupply',
        'formattedMintPrice',
        'proposerFee',
        'treasuryAddress'
      ])
    ).toString();

  return validateForm(schema.value, input.value);
});

const isViewOnly = computed(() => {
  return !isSpaceController;
});

function submit() {
  if (spaceCollectionsInfo.value[props.space.id]?.address) {
    update(input.value);
  } else {
    deploy(input.value);
  }
}

function toggleStatus() {
  toggleMintStatus(!spaceCollectionsInfo.value[props.space.id].enabled);
}

function resetForm() {
  input.value = pick(spaceCollectionsInfo.value[props.space.id], [
    'maxSupply',
    'formattedMintPrice',
    'proposerFee',
    'treasuryAddress'
  ]);
}

function nextStep() {
  if (!isViewOnly || !isValidJson) return forceShowError();
  emit('next');
}

watch(
  () => init(),
  async () => {
    input.value = spaceCollectionsInfo.value[props.space.id]
      ? pick(spaceCollectionsInfo.value[props.space.id], [
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
      v-if="isViewOnly"
      class="md:mx-0"
      level="info"
      is-responsive
    >
      <span v-if="isSpaceController"> Update to SnapIt! is coming soon </span>
      <span v-else>
        You are in view only mode, to modify space settings connect with a
        controller wallet.
      </span>
    </BaseMessageBlock>
    <BaseBlock
      v-if="spaceCollectionsInfo[props.space.id]?.address"
      class="mb-2 mt-3"
      title="Mint status"
    >
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
            :variant="enabled && 'danger'"
            @click="toggleStatus()"
          >
            {{ enabled ? 'Disable' : 'Enable' }} minting
          </BaseButton>
        </div>
      </div>
    </BaseBlock>

    <BaseBlock title="SnapIt!">
      <div class="flex w-full flex-col gap-y-3">
        <TuneInput
          v-model.number="input.maxSupply"
          label="Max supply"
          hint="Maximum number of NFTs per proposal"
          placeholder="100"
          min="1"
          type="number"
          :disabled="isViewOnly"
          :error="validationErrors?.maxSupply"
          autofocus
        />

        <TuneInput
          v-model.number="input.formattedMintPrice"
          label="Mint price"
          min="0"
          :hint="`In ${mintCurrency}`"
          type="number"
          placeholder="0.5"
          :error="validationErrors?.formattedMintPrice"
          :disabled="isViewOnly"
        />

        <TuneInput
          v-model.number="input.proposerFee"
          label="Proposer fees"
          type="number"
          hint="Percentage of the mint price, shared with the proposal author"
          placeholder="5"
          min="0"
          :max="maxProposerCut"
          :error="validationErrors?.proposerFee"
          :disabled="isViewOnly"
        />

        <TuneInput
          v-model.trim="input.treasuryAddress"
          label="Space treasury wallet"
          hint="Wallet address"
          placeholder="0x0000"
          :error="validationErrors?.treasuryAddress"
          :disabled="isViewOnly"
        />

        <div v-if="context !== 'settings'" class="px-4 md:px-0">
          <SetupButtonBack @click="emit('back')" />
          <SetupButtonNext @click="nextStep" />
        </div>
      </div>
    </BaseBlock>

    <BaseButton
      v-if="!spaceCollectionsInfo[props.space.id]"
      primary
      class="w-full"
      :disabled="isViewOnly"
      :loading="loading"
      @click="submit"
    >
      Setup SnapIt!
    </BaseButton>
    <div v-else class="flex gap-5 px-4 pt-2 md:px-0">
      <BaseButton class="mb-2 block w-full" @click="resetForm">
        {{ $t('reset') }}
      </BaseButton>
      <BaseButton
        primary
        class="block w-full"
        :disabled="
          isViewOnly || Object.keys(validationErrors).length > 0 || !dirtyFields
        "
        @click="submit"
      >
        Save
      </BaseButton>
    </div>
  </template>
</template>
