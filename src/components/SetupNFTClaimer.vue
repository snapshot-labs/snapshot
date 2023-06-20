<script lang="ts" setup>
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: string;
  space: ExtendedSpace;
}>();
const emit = defineEmits(['back', 'next']);

const { forceShowError } = useFormSpaceSettings('setup');

const { deploy, spaceCollectionsInfo, init, mintCurrency } = useNFTClaimer(
  props.space
);

const { isSpaceController } = useSpaceController();

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
  return false; /* !isSpaceController.value &&*/
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
    Only the space controller can edit
  </BaseMessageBlock>
  <div class="flex w-full flex-col">
    <TuneInput
      v-model="input.maxSupply"
      label="Max supply"
      placeholder="100"
      :disabled="isViewOnly"
      autofocus
    />

    <TuneInput
      v-model="input.formattedMintPrice"
      label="Mint price"
      :hint="`In ${mintCurrency}`"
      placeholder="2.65"
      :disabled="isViewOnly"
    />

    <TuneInput
      v-model="input.proposerFee"
      label="Proposer fees"
      hint="In percentage"
      placeholder="5"
      :disabled="isViewOnly"
    />

    <TuneInput
      v-model="input.treasuryAddress"
      label="Proposer cut address"
      placeholder="0x0000"
      :disabled="isViewOnly"
    />

    <BaseButton
      v-if="!spaceCollectionsInfo[props.space.id]"
      primary
      class="mt-3"
      :disabled="isViewOnly"
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
