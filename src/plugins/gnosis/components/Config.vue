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
      <BaseButton class="w-full">
        <select
          v-model="input.network"
          class="input w-full text-center"
          :placeholder="$t('selectNetwork')"
          required
        >
          <option value="1" selected>Mainnet</option>
          <option value="100">xDai</option>
        </select>
      </BaseButton>
      <BaseButton class="w-full">
        <input
          v-model="input.conditionId"
          class="input w-full text-center"
          :placeholder="$t('conditionId')"
          required
        />
      </BaseButton>
      <BaseButton class="w-full">
        <input
          v-model="input.baseTokenAddress"
          class="input w-full text-center"
          :placeholder="$t('basetokenAddress')"
          required
        />
      </BaseButton>
      <BaseButton class="w-full">
        <input
          v-model="input.quoteCurrencyAddress"
          class="input w-full text-center"
          :placeholder="$t('quoteAddress')"
          required
        />
      </BaseButton>
    </div>
  </div>
  <div v-if="preview">
    <GnosisCustomBlock :proposal-config="input" :choices="getChoices()" />
  </div>
  <BaseButton
    v-if="!preview"
    :disabled="!isValid"
    class="my-2 w-full"
    primary
    @click="preview = true"
  >
    {{ $t('create.preview') }}
  </BaseButton>
  <BaseButton
    v-if="preview"
    class="mb-2 w-full"
    primary
    @click="preview = false"
  >
    {{ $t('back') }}
  </BaseButton>
</template>
