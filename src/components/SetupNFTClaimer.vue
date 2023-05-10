<script lang="ts" setup>
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  context: string;
  space: ExtendedSpace;
}>();
const emit = defineEmits(['back', 'next']);

const { forceShowError } = useFormSpaceSettings('setup');

const isReadonly = ref(false);
const isValidJson = ref(false);

const FORM_DEFAULT = {
  minSupply: 0,
  maxSupply: 10000,
  minPrice: 0,
  sharing: 0,
  enabled: false
};

const form = JSON.parse(JSON.stringify(FORM_DEFAULT));

function nextStep() {
  if (!isReadonly || !isValidJson) return forceShowError();
  emit('next');
}
</script>

<template>
  <div class="flex w-full flex-col">
    <TuneTextareaJson
      v-model="form"
      @update:is-valid="value => (isValidJson = value)"
    />

    <div v-if="context !== 'settings'" class="px-4 md:px-0">
      <SetupButtonBack @click="emit('back')" />
      <SetupButtonNext @click="nextStep" />
    </div>
  </div>
</template>
