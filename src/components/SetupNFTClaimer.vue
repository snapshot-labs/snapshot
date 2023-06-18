<script lang="ts" setup>
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: string;
  isViewOnly: boolean;
  space: ExtendedSpace;
}>();
const emit = defineEmits(['back', 'next']);

const { forceShowError } = useFormSpaceSettings('setup');

const { deploy, spaceCollectionsInfo, init } = useNFTClaimer(props.space);

const isReadonly = ref(props.isViewOnly);
const isValidJson = ref(false);
const input = ref(
  spaceCollectionsInfo.value[props.space.id] ?? {
    maxSupply: '',
    mintPrice: '',
    proposerCut: '',
    treasuryAddress: ''
  }
);

function submit() {
  deploy(input.value);
}

function nextStep() {
  if (!isReadonly || !isValidJson) return forceShowError();
  emit('next');
}

onMounted(init);
</script>

<template>
  <div class="flex w-full flex-col">
    <TuneInput
      v-model="input.maxSupply"
      label="Max supply"
      placeholder="100"
      :disabled="isReadonly"
      autofocus
    />

    <TuneInput
      v-model="input.mintPrice"
      label="Mint price"
      placeholder="100000"
      :disabled="isReadonly"
    />

    <TuneInput
      v-model="input.proposerCut"
      label="Proposer cut"
      placeholder="5"
      :disabled="isReadonly"
    />

    <TuneInput
      v-model="input.treasuryAddress"
      label="Proposer cut address"
      placeholder="0x0000"
      :disabled="isReadonly"
    />

    <BaseButton primary class="mt-3" :disabled="isReadonly" @click="submit">
      Setup NFT Claimer
    </BaseButton>

    <div v-if="context !== 'settings'" class="px-4 md:px-0">
      <SetupButtonBack @click="emit('back')" />
      <SetupButtonNext @click="nextStep" />
    </div>
  </div>
</template>
