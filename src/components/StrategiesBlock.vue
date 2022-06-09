<script setup lang="ts">
import { ref, watch } from 'vue';
import { SpaceStrategy } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  form: { network: string; symbol: string; strategies: SpaceStrategy[] };
  getError: (field: string) => string;
}>();

const emit = defineEmits(['updateStrategies', 'updateNetwork', 'updateSymbol']);

const strategiesClone = ref<SpaceStrategy[]>(clone(props.form.strategies));

const strategyObj = {
  name: '',
  network: '',
  params: {}
};

const modalStrategyOpen = ref(false);
const currentStrategyIndex = ref<number | null>(null);
const currentStrategy = ref<SpaceStrategy>(clone(strategyObj));

function handleRemoveStrategy(i) {
  strategiesClone.value = strategiesClone.value.filter(
    (strategy, index) => index !== i
  );
}

function handleEditStrategy(i) {
  currentStrategyIndex.value = i;
  currentStrategy.value = clone(strategiesClone.value[i]);
  modalStrategyOpen.value = true;
}

function handleAddStrategy() {
  currentStrategyIndex.value = null;
  currentStrategy.value = strategyObj;
  modalStrategyOpen.value = true;
}

function handleSubmitStrategy(strategy) {
  if (currentStrategyIndex.value !== null) {
    strategiesClone.value[currentStrategyIndex.value] = strategy;
  } else {
    strategiesClone.value = strategiesClone.value.concat(strategy);
  }
}

watch(
  strategiesClone,
  () => {
    emit('updateStrategies', strategiesClone.value);
  },
  { deep: true }
);
</script>

<template>
  <BaseBlock :title="$t('spaceStrategies.title')">
    <div class="mb-4 w-full space-y-2 sm:flex sm:space-y-0 sm:space-x-4">
      <ComboboxNetwork
        :network="form.network"
        @select="value => emit('updateNetwork', value)"
      />
      <BaseInput
        :model-value="form.symbol"
        :title="$t(`spaceStrategies.symbol`)"
        placeholder="e.g. BAL"
        :error="getError('symbol')"
        @update:model-value="value => emit('updateSymbol', value)"
      />
    </div>
    <div class="mb-4 grid gap-3">
      <StrategiesBlockItem
        :strategies-form="strategiesClone"
        @edit-strategy="i => handleEditStrategy(i)"
        @remove-strategy="i => handleRemoveStrategy(i)"
      />
    </div>

    <StrategiesBlockWarning :error="getError('strategies')" />

    <BaseButton class="block w-full" @click="handleAddStrategy">
      {{ $t('spaceStrategies.addStrategy') }}
    </BaseButton>
  </BaseBlock>

  <teleport to="#modal">
    <ModalStrategy
      :open="modalStrategyOpen"
      :strategy="currentStrategy"
      :default-network="form.network"
      @close="modalStrategyOpen = false"
      @add="handleSubmitStrategy"
    />
  </teleport>
</template>
