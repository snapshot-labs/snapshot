<script lang="ts" setup>
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: string;
  space: ExtendedSpace;
}>();
const emit = defineEmits(['back', 'next']);

const { forceShowError } = useFormSpaceSettings('setup');

const { deploy } = useNFTClaimer(props.space);

const isReadonly = ref(false);
const isValidJson = ref(false);
const input = ref({
  maxSupply: 10,
  mintPrice: 100,
  proposerCut: 5,
  treasuryAddress: '0x91FD2c8d24767db4Ece7069AA27832ffaf8590f3'
});

function submit() {
  deploy(input.value);
}

function nextStep() {
  if (!isReadonly || !isValidJson) return forceShowError();
  emit('next');
}
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
