<script setup lang="ts">
import { computed, ref } from 'vue';
import { ExtendedSpace } from '@/helpers/interfaces';
import {
  Transaction,
  TransactionBuilderConfig
} from '@/helpers/transactionBuilder';
import { mapLegacyModuleConfig } from '@/plugins/safeSnap/utils';
import {
  getSafeBalances,
  getSafeCollectables,
  AbstractSafeModule,
  SafeModuleConfig,
  SafeModuleType,
  SafeModuleExecutionData
} from '@/helpers/safe';
import { RealityModule } from './realityModule';
import { UmaModule } from './umaModule';

const props = defineProps<{
  modelValue: {
    safeSnap?: SafeModuleExecutionData[];
    [otherPlugins: string]: any;
  };
  space: ExtendedSpace;
}>();

const emit = defineEmits(['update']);

const proposalExecutionData = ref<SafeModuleExecutionData[]>(
  props.modelValue.safeSnap || []
);

const updateProposalExecutionData = (
  builderIndex: number,
  safeModule: AbstractSafeModule,
  updatedBatches: Transaction[][]
) => {
  proposalExecutionData.value[builderIndex] = {
    network: safeModule.network,
    address: safeModule.address,
    type: safeModule.type,
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

const safeModuleConfigs = computed(() =>
  mapLegacyModuleConfig(props.space.plugins.safeSnap)
);
const transactionBuilders = ref<TransactionBuilderConfig[]>([]);
const isInitializingTransactionBuilder = ref<boolean>(false);

async function addTransactionBuilder(
  config: SafeModuleConfig,
  batches: Transaction[][] = [[]]
): Promise<void> {
  isInitializingTransactionBuilder.value = true;

  let safeModule: AbstractSafeModule;

  switch (config.type) {
    case SafeModuleType.REALITY:
      safeModule = new RealityModule(config);
      break;
    case SafeModuleType.UMA:
      safeModule = new UmaModule(config);
      break;
    default:
      throw new Error(`Unknown safe module type: ${config.type}`);
  }

  await safeModule.setSafeAddress();

  const availableFunds = await getSafeBalances(
    config.network,
    safeModule.safeAddress
  );
  const availableCollectables = await getSafeCollectables(
    config.network,
    safeModule.safeAddress
  );

  isInitializingTransactionBuilder.value = false;

  transactionBuilders.value.push({
    title: `${
      config.type.slice(0, 1).toUpperCase() + config.type.slice(1)
    } (Safe: ${safeModule.safeAddress.slice(0, 8)}...)`,
    availableFunds,
    availableCollectables,
    safeModule,
    batches
  });
}

function removeTransactionBuilder(builderIndex: number) {
  transactionBuilders.value = transactionBuilders.value.filter(
    (_, index) => index !== builderIndex
  );
  removeProposalExecutionData(builderIndex);
}

proposalExecutionData.value.forEach(
  (executionData: SafeModuleExecutionData) => {
    addTransactionBuilder(executionData, executionData.batches);
  }
);
</script>

<template>
  <div>
    <div class="mb-3 space-y-3">
      <TransactionBuilder
        v-for="(builder, index) in transactionBuilders"
        :key="index"
        :title="builder.title"
        :available-funds="builder.availableFunds"
        :available-collectables="builder.availableCollectables"
        :existing-batches="builder.batches"
        @remove-transaction-builder="removeTransactionBuilder(index)"
        @update-batches="
          updateProposalExecutionData(index, builder.safeModule, $event)
        "
      />
    </div>
    <div v-if="isInitializingTransactionBuilder" class="p-4 text-center">
      <LoadingSpinner /> initializing safe module
    </div>
    <div class="space-y-2">
      <BaseButton
        v-for="(safeModuleConfig, index) in safeModuleConfigs"
        :key="index"
        class="w-full"
        @click="addTransactionBuilder(safeModuleConfig)"
      >
        add {{ safeModuleConfig.type }} module
      </BaseButton>
    </div>
  </div>
</template>
