<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { ParamType } from '@ethersproject/abi';
import { ParamValue } from '@/helpers/transactionBuilder';

const props = withDefaults(
  defineProps<{
    params: ParamType[];
    values: ParamValue[];
    canRemoveItems?: boolean;
  }>(),
  {
    canRemoveItems: false
  }
);

const emit = defineEmits<{
  (e: 'updateValues', values: ParamValue[]): void;
  (e: 'removeItem', index: number): void;
}>();

const input = ref<ParamValue[]>(props.values);

onMounted(() => (input.value = props.values));

watch(
  () => props.values,
  () => (input.value = props.values)
);

watch(input, () => emit('updateValues', input.value), { deep: true });
</script>

<template>
  <div>
    <div v-for="(param, index) in params" :key="index" class="relative">
      <button
        v-if="canRemoveItems"
        class="absolute top-0 right-0"
        @click="emit('removeItem', index)"
      >
        remove
      </button>
      <TransactionBuilderFormContractParamBool
        v-if="param.baseType === 'bool'"
        :bool-value="(input[index] as boolean)"
        :label="param.name"
        @update-bool-value="input[index] = $event"
      />
      <TransactionBuilderFormContractParamBytes
        v-if="param.baseType.startsWith('bytes')"
        :bytes-string="(input[index] as string)"
        :bytes-type="param.baseType"
        :label="param.name"
        @update-bytes-string="input[index] = $event"
      />
      <TransactionBuilderFormContractParamInt
        v-if="
          param.baseType.startsWith('uint') || param.baseType.startsWith('int')
        "
        :int-string="(input[index] as string)"
        :int-type="param.baseType"
        :label="param.name"
        @update-int-string="input[index] = $event"
      />
      <TransactionBuilderFormContractParamAddress
        v-if="param.baseType === 'address'"
        :address="(input[index] as string)"
        :label="param.name"
        @update-address="input[index] = $event"
      />
      <template v-if="param.baseType === 'string'">
        <LabelInput>{{ param.name }}</LabelInput>
        <InputString
          :model-value="(input[index] as string)"
          @update:model-value="input[index] = $event"
        />
      </template>
      <TransactionBuilderFormContractParamTuple
        v-if="param.baseType === 'tuple'"
        :params="param.components"
        :values="(input[index] as ParamValue[])"
        :label="param.name"
        @update-values="input[index] = $event"
      />
      <TransactionBuilderFormContractParamArray
        v-if="param.baseType === 'array'"
        :child-sample="param.arrayChildren"
        :values="(input[index] as ParamValue[])"
        :label="param.name"
        @update-values="input[index] = $event"
      />
    </div>
  </div>
</template>
