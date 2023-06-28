<script lang="ts" setup>
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: string;
  space: ExtendedSpace;
}>();
const emit = defineEmits(['back', 'next']);

const { forceShowError } = useFormSpaceSettings('setup');

const {
  deploy,
  spaceCollectionsInfo,
  loading,
  init,
  inited,
  mintCurrency,
  toggleMintStatus
} = useNFTClaimer(props.space);

const enabled = computed(() => {
  return spaceCollectionsInfo.value[props.space.id]?.enabled;
});

// TODO Enable in production
// const { isSpaceController } = useSpaceController();
const isSpaceController = true;

const isValidJson = ref(false);
const input = ref();

const isViewOnly = computed(() => {
  return !isSpaceController;
});

function submit() {
  if (spaceCollectionsInfo.value[props.space.id]?.address) {
    console.log('Update not implemented yet!');
  } else {
    deploy(input.value);
  }
}

function toggleStatus() {
  toggleMintStatus(!spaceCollectionsInfo.value[props.space.id].enabled);
}

function nextStep() {
  if (!isViewOnly || !isValidJson) return forceShowError();
  emit('next');
}

watch(
  () => init(),
  () => {
    input.value = spaceCollectionsInfo.value[props.space.id] ?? {
      maxSupply: '',
      formattedMintPrice: '',
      proposerFee: '',
      treasuryAddress: ''
    };
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
      <div class="flex w-full flex-col">
        <TuneInput
          v-model="input.maxSupply"
          class="mb-3"
          label="Max supply"
          hint="Maximum number of NFTs per proposal"
          placeholder="100"
          min="1"
          type="number"
          :disabled="isViewOnly"
          autofocus
        />

        <TuneInput
          v-model="input.formattedMintPrice"
          class="mb-3"
          label="Mint price"
          :hint="`In ${mintCurrency}`"
          type="number"
          placeholder="0.5"
          :disabled="isViewOnly"
        />

        <TuneInput
          v-model="input.proposerFee"
          class="mb-3"
          label="Proposer fees"
          type="number"
          hint="Percentage of the mint price, shared with the proposal author"
          placeholder="5"
          min="0"
          max="100"
          :disabled="isViewOnly"
        />

        <TuneInput
          v-model="input.treasuryAddress"
          class="mb-3"
          label="Space treasury wallet"
          hint="Wallet address"
          placeholder="0x0000"
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

    <div v-else class="flex">
      <div class="grow"></div>
      <BaseButton class="grow" primary :disabled="isViewOnly" @click="submit">
        Save
      </BaseButton>
    </div>
  </template>
</template>
