<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import { ConnextModDetails } from '../../types/connext';
import SafeSelectItem from '../Select/SafeSelectItem.vue';
import SafeSnapInputAddress from '../Input/Address.vue';
import SafeSnapInputMethodParameter from '../Input/MethodParameter.vue';
import { FunctionFragment } from '@ethersproject/abi';
import { shorten } from '@/helpers/utils';
import {
  CustomConnextTransaction,
  SafeTransactionConfig
} from '@/helpers/interfaces';
import SafeSnapSimulationTenderly from '../Simulation/Tenderly.vue';

export interface ConnextZodiacModFormProps {
  loading: boolean;
  config: SafeTransactionConfig;
  destinationSafe: string;
  contractAddress: string;
  connextModList: ConnextModDetails[];
  isDetails: boolean;
  preview: boolean;
  methods: FunctionFragment[];
  methodIndex: number;
  parameters: string[];
  selectedMethod: any;
  destinationSafeChain: string;
  relayerFee: string;
  modelValue: CustomConnextTransaction;
}

const props = defineProps<ConnextZodiacModFormProps>();
const emit = defineEmits([
  'update:modelValue',
  'update:parameterChange',
  'update:methodChange'
]);

const zodiacConnextModList = computed(() =>
  props.connextModList.map(safe => ({
    value: safe.dao,
    name: safe.dao,
    extras: {
      network: safe.network
    }
  }))
);
</script>

<template>
  <div
    v-if="props.isDetails && props.modelValue && props.selectedMethod.inputs"
    class="grid gap-y-3 grid-cols-1 mt-3 px-3"
  >
    <div class="flex space-x-1">
      <label>Destination Safe: </label>
      <SafeSelectItem
        :network="props.destinationSafeChain"
        :safe-address="props.destinationSafe"
      />
    </div>
    <p>Contract Address: {{ shorten(props.contractAddress) }}</p>
    <p>Function: {{ props.selectedMethod.name }}</p>
    <p v-for="(input, index) in props.selectedMethod.inputs" :key="input.name">
      Param ({{ input.name }}): {{ props.parameters[index] }}
    </p>
    <p>Relayer fee: {{ props.relayerFee }}</p>
    <SafeSnapSimulationTenderly
      v-if="props.modelValue.simulation"
      :is-details="props.isDetails"
      :model-value-to-simulate="props.modelValue"
      :config="props.config"
      :run-simulation="false"
      :default-simulation-result="props.modelValue.simulation"
    />
  </div>

  <div v-if="!props.isDetails" class="grid gap-y-3 grid-cols-1 mt-3">
    <TuneListbox
      :disabled="props.loading"
      :model-value="props.destinationSafe"
      :items="zodiacConnextModList"
      label="Destination Safe"
      @update:model-value="
        value =>
          emit('update:modelValue', {
            field: 'destinationSafe',
            value: value
          })
      "
    >
      <template #selected="{ selectedItem }">
        <span v-if="!selectedItem.value">Select a destination safe</span>
        <SafeSelectItem
          v-if="selectedItem.extras"
          :network="selectedItem.extras.network"
          :safe-address="selectedItem.value"
        />
      </template>
      <template #item="{ item }">
        <SafeSelectItem
          v-if="item.extras"
          :network="item.extras.network"
          :safe-address="item.value"
        />
      </template>
    </TuneListbox>
    <hr
      v-if="!props.isDetails && props.destinationSafe"
      class="border-skin-border"
    />
    <div v-if="destinationSafe">
      <label>Contract Address</label>
      <SafeSnapInputAddress
        v-model="props.contractAddress"
        :disabled="props.preview || props.loading || props.isDetails"
        :input-props="{
          required: true
        }"
        @valid-address="
          address =>
            emit('update:modelValue', {
              field: 'contractAddress',
              value: address
            })
        "
      />
      <div v-if="methods.length" class="mt-2">
        <UiSelect
          v-if="!isDetails"
          :custom-styles="'safesnap-custom-select'"
          v-model="props.methodIndex"
          :disabled="props.preview || props.loading"
          @change="() => emit('update:methodChange')"
        >
          <template #label>function</template>
          <option v-for="(method, i) in methods" :key="i" :value="i">
            {{ method.name }}()
          </option>
        </UiSelect>
        <div
          v-if="selectedMethod && selectedMethod.inputs.length"
          class="space-y-2"
        >
          <SafeSnapInputMethodParameter
            v-for="(input, index) in selectedMethod.inputs"
            :key="input.name"
            :disabled="props.preview || props.loading"
            :model-value="parameters[index]"
            :parameter="input"
            :is-details="isDetails"
            @update:modelValue="
              event =>
                emit('update:parameterChange', {
                  index,
                  value: event
                })
            "
          />
        </div>
      </div>
    </div>
    <div v-if="props.loading" class="flex space-x-2">
      <LoadingSpinner class="pb-[3px]" />
      <p class="text-[12px]">Encoding connext transaction</p>
    </div>
  </div>
</template>
