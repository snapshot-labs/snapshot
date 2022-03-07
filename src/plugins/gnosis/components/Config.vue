<script setup>
import { ref, reactive, computed, watch } from 'vue';
import GnosisCustomBlock from './CustomBlock.vue';

const props = defineProps(['modelValue', 'proposal', 'network']);
const emit = defineEmits(['update:modelValue']);

const input = reactive(props.modelValue);
const preview = ref(false);

const isValid = computed(() => {
  return (
    (input.conditionId &&
      input.baseTokenAddress &&
      input.quoteCurrencyAddress) ||
    input === {}
  );
});

watch(input, () => {
  emit('update:modelValue', input);
});

const getChoices = () => {
  return props.proposal.choices.map(choice => choice.text);
};
</script>

<template>
  <div class="mb-2 text-center">
    <h4 class="mb-3">{{ $t('marketDetails') }}</h4>
    <div v-if="!preview" class="space-y-2">
      <UiButton class="w-full">
        <select
          v-model="input.network"
          class="input w-full text-center"
          :placeholder="$t('selectNetwork')"
          required
        >
          <option value="1" selected>Mainnet</option>
          <option value="100">xDai</option>
        </select>
      </UiButton>
      <UiButton class="w-full">
        <input
          v-model="input.conditionId"
          class="input w-full text-center"
          :placeholder="$t('conditionId')"
          required
        />
      </UiButton>
      <UiButton class="w-full">
        <input
          v-model="input.baseTokenAddress"
          class="input w-full text-center"
          :placeholder="$t('basetokenAddress')"
          required
        />
      </UiButton>
      <UiButton class="w-full">
        <input
          v-model="input.quoteCurrencyAddress"
          class="input w-full text-center"
          :placeholder="$t('quoteAddress')"
          required
        />
      </UiButton>
    </div>
  </div>
  <div v-if="preview">
    <GnosisCustomBlock :proposalConfig="input" :choices="getChoices()" />
  </div>
  <UiButton
    v-if="!preview"
    :disabled="!isValid"
    @click="preview = true"
    class="w-full my-2"
    primary
  >
    {{ $t('create.preview') }}
  </UiButton>
  <UiButton v-if="preview" @click="preview = false" class="w-full mb-2" primary>
    {{ $t('back') }}
  </UiButton>
</template>
