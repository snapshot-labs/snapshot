<script lang="ts" setup>
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: string;
  space: ExtendedSpace;
}>();
const emit = defineEmits(['back', 'next']);

const { forceShowError } = useFormSpaceSettings('setup');

const { deploy, collectionsInfo, init } = useNFTClaimer(props.space);

const isReadonly = ref(false);
const isValidJson = ref(false);
const input = ref(
  collectionsInfo.value[props.space.id] ?? {
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
    <TuneForm
      ref="formRef"
      v-model="input"
      :definition="{
        type: 'object',
        title: 'NftClaimer',
        additionalProperties: true,
        required: ['maxSupply', 'mintPrice', 'proposerCut', 'treasuryAddress'],
        properties: {
          maxSupply: {
            type: 'number',
            title: 'Max Supply',
            examples: ['100']
          },
          mintPrice: {
            type: 'number',
            title: 'Mint price',
            hint: 'Price in WETH',
            examples: ['1000']
          },
          proposerCut: {
            type: 'number',
            title: 'Proposer cut',
            hint: 'In percentage',
            examples: ['5']
          },
          treasuryAddress: {
            type: 'string',
            title: 'Proposer cut address',
            examples: ['0x0000']
          }
        }
      }"
      :error="{}"
    />
    <TuneButton primary class="mt-3" @click="submit">
      Setup NFT Claimer
    </TuneButton>

    <div v-if="context !== 'settings'" class="px-4 md:px-0">
      <SetupButtonBack @click="emit('back')" />
      <SetupButtonNext @click="nextStep" />
    </div>
  </div>
</template>
