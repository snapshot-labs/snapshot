<script setup lang="ts">
import { watch, ref, computed, onMounted } from 'vue';
import { useStrategies } from '@/composables';

const props = defineProps<{
  strategyName: string;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);

const {
  getExtendedStrategy,
  strategyDefinition,
  loadingExtendedStrategy,
  extendedStrategy
} = useStrategies();

const paramsComputed = computed({
  get: () => props.modelValue,
  set: value => {
    emit('update:modelValue', value);
  }
});

const isValidJson = ref(true);

watch(
  () => props.strategyName,
  () => {
    paramsComputed.value = {};
    getExtendedStrategy(props.strategyName);
    if (extendedStrategy.value?.examples?.[0]?.strategy?.params) {
      paramsComputed.value = extendedStrategy.value.examples[0].strategy.params;
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
