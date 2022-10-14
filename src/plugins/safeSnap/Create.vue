<script setup lang="ts">
import { computed, ref } from 'vue';
import { ExtendedSpace } from '@/helpers/interfaces';
import { Transaction } from '@/helpers/transactionBuilder';
import { mapLegacyConfig } from '@/plugins/safeSnap/utils';
import {
  SafeModuleLogos,
  ExecutionData,
  ExecutionDataABIs
} from '@/helpers/safe';

const props = defineProps<{
  modelValue: {
    safeSnap?: ExecutionData[];
    [otherPlugins: string]: any;
  };
  space: ExtendedSpace;
}>();

const emit = defineEmits(['update']);

const safeConfigs = computed(() =>
  mapLegacyConfig(props.space.plugins.safeSnap)
);

const proposalExecutionData = ref<ExecutionData[]>(
  props.modelValue.safeSnap || []
);

const updateTransactionBatches = (
  builderIndex: number,
  updatedBatches: Transaction[][]
) => {
  proposalExecutionData.value[builderIndex].batches = updatedBatches;
  emit('update', { key: 'safeSnap', form: proposalExecutionData.value });
};

const updateContractABIs = (
  builderIndex: number,
  updatedAbis: ExecutionDataABIs
) => {
  proposalExecutionData.value[builderIndex].abis = updatedAbis;
  emit('update', { key: 'safeSnap', form: proposalExecutionData.value });
};

const removeProposalExecutionData = (builderIndex: number) => {
  proposalExecutionData.value = proposalExecutionData.value.filter(
    (_, index) => index !== builderIndex
  );
  emit('update', { key: 'safeSnap', form: proposalExecutionData.value });
};

function addProposalExecutionData(executionData: ExecutionData) {
  proposalExecutionData.value.push(executionData);
}
</script>

<template>
  <div>
    <div class="mb-3 space-y-3">
      <TransactionBuilder
        v-for="(executionData, index) in proposalExecutionData"
        :key="index"
        :safe="executionData.safe"
        :initial-batches="executionData.batches"
        :initial-abis="executionData.abis"
        @remove-transaction-builder="removeProposalExecutionData(index)"
        @update-batches="updateTransactionBatches(index, $event)"
        @update-abis="updateContractABIs(index, $event)"
      />
    </div>
    <div class="space-y-2">
      <div
        v-for="safeConfig in safeConfigs"
        :key="safeConfig.safe.address"
        class="space-y-2"
      >
        <BaseButton
          v-for="(module, index) in safeConfig.modules"
          :key="index"
          class="flex w-full items-center text-left"
          @click="
            addProposalExecutionData({
              safe: safeConfig.safe,
              batches: [[]],
              abis: {},
              module
            })
          "
        >
          {{ safeConfig.safe.name }}:
          <span class="ml-1 first-letter:uppercase"
            >{{ module.type }} execution</span
          >
          <img
            :src="SafeModuleLogos[module.type]"
            :alt="module.type"
            class="ml-auto inline h-4"
          />
        </BaseButton>
        <BaseButton
          class="w-full text-left"
          @click="
            addProposalExecutionData({
              safe: safeConfig.safe,
              batches: [[]],
              abis: {}
            })
          "
        >
          {{ safeConfig.safe.name }}: Manual execution
        </BaseButton>
      </div>
    </div>
  </div>
</template>
