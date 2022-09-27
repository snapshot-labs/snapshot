<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ParamType } from '@ethersproject/abi';
import { ParamValue, ParamValueError } from '@/helpers/transactionBuilder';

const props = defineProps<{
  params: ParamType[];
  values: ParamValue[];
}>();

const emit = defineEmits<{
  (e: 'updateValues', values: ParamValue[]): void;
  (e: 'updateErrors', values: ParamValueError[]): void;
}>();

const input = ref<ParamValue[]>(props.values);
const errors = ref<ParamValueError[]>([]);

onMounted(() => (input.value = props.values));

watch(
  () => props.params,
  () => {
    input.value = props.values;
    errors.value = [];
  }
);
watch(input, () => emit('updateValues', input.value), { deep: true });
watch(errors, () => emit('updateErrors', errors.value), { deep: true });
</script>

<template>
  <div>
    <div v-for="(param, index) in params" :key="index">
      <TransactionBuilderFormContractParamBool
        v-if="param.baseType === 'bool'"
        :model-value="(input[index] as boolean) || false"
        :label="param.name"
        @update:model-value="input[index] = $event"
      />
      <TransactionBuilderFormContractParamBytes
        v-if="param.baseType.startsWith('bytes')"
        :bytes-string="(input[index] as string) || ''"
        :bytes-type="param.baseType"
        :label="param.name"
        @update-bytes-string="input[index] = $event"
        @update-error="errors[index] = $event"
      />
      <TransactionBuilderFormContractParamInt
        v-if="
          param.baseType.startsWith('uint') || param.baseType.startsWith('int')
        "
        :int-string="(input[index] as string) || ''"
        :int-type="param.baseType"
        :label="param.name"
        @update-int-string="input[index] = $event"
        @update-error="errors[index] = $event"
      />
      <TransactionBuilderFormContractParamAddress
        v-if="param.baseType === 'address'"
        :address="(input[index] as string) || ''"
        :label="param.name"
        @update-address="input[index] = $event"
        @update-error="errors[index] = $event"
      />
      <template v-if="param.baseType === 'string'">
        <LabelInput>{{ param.name }}</LabelInput>
        <InputString
          :model-value="(input[index] as string) || ''"
          @update:model-value="input[index] = $event"
        />
      </template>
      <TransactionBuilderFormContractParamTuple
        v-if="param.baseType === 'tuple'"
        :params="param.components"
        :values="(input[index] as ParamValue[]) || []"
        :label="param.name"
        @update-values="input[index] = $event"
        @update-errors="errors[index] = $event"
      />
    </div>
  </div>
</template>
