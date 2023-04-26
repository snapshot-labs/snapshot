<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { validateForm } from '@/helpers/validation';

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
const formRef = ref();

const paramsComputed = computed({
  get: () => props.modelValue,
  set: value => {
    emit('update:modelValue', value);
  }
});

const validationErrors = computed(() => {
  return validateForm(strategyDefinition.value || {}, paramsComputed.value);
});

const isValid = computed(() => {
  return Object.values(validationErrors.value).length === 0;
});

function forceShowError() {
  formRef?.value?.forceShowError();
}

defineExpose({
  forceShowError
});

watch(
  [isValidJson, isValid],
  () => {
    if (isValidJson.value && isValid.value) {
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

    <TuneForm
      v-else-if="strategyDefinition"
      ref="formRef"
      v-model="paramsComputed"
      :definition="strategyDefinition"
      :error="validationErrors"
    />

    <TuneTextareaJson
      v-else
      v-model="paramsComputed"
      v-model:is-valid="isValidJson"
      label="Params"
      :placeholder="$t('strategyParameters')"
      class="input text-left"
    />
  </div>
</template>
