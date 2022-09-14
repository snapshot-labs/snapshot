<script setup lang="ts">
import { computed, ref } from 'vue';
import { ExtendedSpace } from '@/helpers/interfaces';
import { Transaction } from '@/helpers/transactionBuilder';
import { mapLegacyConfig } from '@/plugins/safeSnap/utils';
import {
  SafeModuleLogos,
  getSafeFunds,
  getSafeCollectables,
  ExecutionData,
  TransactionBuilderInitData
} from '@/helpers/safe';

const props = defineProps<{
  modelValue: {
    safeSnap?: ExecutionData[];
    [otherPlugins: string]: any;
  };
  space: ExtendedSpace;
}>();

const emit = defineEmits(['update']);

const proposalExecutionData = ref<ExecutionData[]>(
  props.modelValue.safeSnap || []
);

const updateProposalExecutionData = (
  builderIndex: number,
  builder: TransactionBuilderInitData,
  updatedBatches: Transaction[][]
) => {
  proposalExecutionData.value[builderIndex] = {
    safe: builder.safe,
    module: builder.module,
    batches: updatedBatches
  };
  emit('update', { key: 'safeSnap', form: proposalExecutionData.value });
};

const removeProposalExecutionData = (builderIndex: number) => {
  proposalExecutionData.value = proposalExecutionData.value.filter(
    (_, index) => index !== builderIndex
  );
  emit('update', { key: 'safeSnap', form: proposalExecutionData.value });
};

const safeConfigs = computed(() =>
  mapLegacyConfig(props.space.plugins.safeSnap)
);
const transactionBuilderInitData = ref<TransactionBuilderInitData[]>([]);

async function addTransactionBuilder(
  executionData: ExecutionData
): Promise<void> {
  const { safe, batches, module } = executionData;
  const getAvailableFunds = () => getSafeFunds(safe.network, safe.address);
  const getAvailableCollectables = () =>
    getSafeCollectables(safe.network, safe.address);

  transactionBuilderInitData.value.push({
    title: `${safe.name} (${safe.network}, ${safe.address.slice(0, 6)})`,
    batches,
    getAvailableFunds,
    getAvailableCollectables,
    safe,
    module
  });
}

function removeTransactionBuilder(builderIndex: number) {
  transactionBuilderInitData.value = transactionBuilderInitData.value.filter(
    (_, index) => index !== builderIndex
  );
  removeProposalExecutionData(builderIndex);
}

proposalExecutionData.value.forEach((executionData: ExecutionData) => {
  addTransactionBuilder(executionData);
});
</script>

<template>
  <div>
    <div class="mb-3 space-y-3">
      <TransactionBuilder
        v-for="(builder, index) in transactionBuilderInitData"
        :key="index"
        :title="builder.title"
        :network="builder.safe.network"
        :initial-batches="builder.batches"
        :default-from-address="builder.safe.address"
        :get-available-funds="builder.getAvailableFunds"
        :get-available-collectables="builder.getAvailableCollectables"
        @remove-transaction-builder="removeTransactionBuilder(index)"
        @update-batches="updateProposalExecutionData(index, builder, $event)"
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
            addTransactionBuilder({
              safe: safeConfig.safe,
              batches: [[]],
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
            addTransactionBuilder({ safe: safeConfig.safe, batches: [[]] })
          "
        >
          {{ safeConfig.safe.name }}: Manual execution
        </BaseButton>
      </div>
    </div>
  </div>
</template>
