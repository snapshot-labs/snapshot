<script setup lang="ts">
import { watch, ref, computed, onMounted } from 'vue';
import { clone, validateSchema } from '@snapshot-labs/snapshot.js/src/utils';

import { useStrategies } from '@/composables';

const props = defineProps<{
  strategyName: string;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue', 'update:isValid']);

const {
  getExtendedStrategy,
  strategyDefinition,
  loadingExtendedStrategy,
  extendedStrategy
} = useStrategies();

const isValidJson = ref(true);

const paramsComputed = computed({
  get: () => props.modelValue,
  set: value => {
    emit('update:modelValue', value);
  }
});

const isValidForm = computed(() => {
  if (strategyDefinition.value) {
    return (
      validateSchema(strategyDefinition.value, paramsComputed.value) === true
    );
  }
  return true;
});

watch(
  [isValidJson, isValidForm],
  () => {
    if (isValidJson.value && isValidForm.value) {
      emit('update:isValid', true);
    } else {
      emit('update:isValid', false);
    }
  },
  { immediate: true }
);

watch(
  () => props.strategyName,
  async () => {
    paramsComputed.value = {};
    await getExtendedStrategy(props.strategyName);
    if (
      !strategyDefinition.value &&
      extendedStrategy.value?.examples?.[0]?.strategy?.params
    ) {
      paramsComputed.value = clone(
        extendedStrategy.value.examples[0].strategy.params
      );
    }
  }
);

onMounted(() => {
  getExtendedStrategy(props.strategyName);
});
</script>

<template>
  <div>
    <div v-if="loadingExtendedStrategy" class="flex justify-center">
      <LoadingSpinner />
    </div>

    <FormObject
      v-else-if="strategyDefinition"
      v-model="paramsComputed"
      :definition="strategyDefinition"
    />

    <TextareaJson
      v-else
      v-model="paramsComputed"
      v-model:is-valid="isValidJson"
      :placeholder="$t('proposalValidation.paramPlaceholder')"
      class="input text-left"
    />
  </div>
</template>
