<script lang="ts" setup>
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: string;
  space: ExtendedSpace;
}>();
const emit = defineEmits(['back', 'next']);

const { forceShowError } = useFormSpaceSettings('setup');

const { deploy, spaceCollectionsInfo, loading, init, mintCurrency } =
  useNFTClaimer(props.space);

// TODO Enable in production
// const { isSpaceController } = useSpaceController();
const isSpaceController = true;

const isValidJson = ref(false);
const input = ref(
  spaceCollectionsInfo.value[props.space.id] ?? {
    maxSupply: '',
    formattedMintPrice: '',
    proposerFee: '',
    treasuryAddress: ''
  }
);

const isViewOnly = computed(() => {
  return !isSpaceController || spaceCollectionsInfo.value[props.space.id];
});

function submit() {
  deploy(input.value);
}

function nextStep() {
  if (!isViewOnly || !isValidJson) return forceShowError();
  emit('next');
}

onMounted(init);
</script>

<template>
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
  <div class="flex w-full flex-col">
    <TuneInput
      v-model="input.maxSupply"
      class="mb-3"
      label="Max supply"
      hint="Maximum number of NFTs per proposal"
      placeholder="100"
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

    <BaseButton
      v-if="!spaceCollectionsInfo[props.space.id]"
      primary
      class="mt-3"
      :disabled="isViewOnly"
      :loading="loading"
      @click="submit"
    >
      Setup NFT Claimer
    </BaseButton>

    <BaseButton
      v-else
      primary
      class="mt-3"
      :disabled="isViewOnly"
      @click="submit"
    >
      Update
    </BaseButton>

    <div v-if="context !== 'settings'" class="px-4 md:px-0">
      <SetupButtonBack @click="emit('back')" />
      <SetupButtonNext @click="nextStep" />
    </div>
  </div>
</template>
