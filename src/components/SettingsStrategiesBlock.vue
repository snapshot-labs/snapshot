<script setup lang="ts">
import { ref, computed } from 'vue';
import { SpaceStrategy } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';

const props = defineProps<{
  form: { network: string; symbol: string; strategies: SpaceStrategy[] };
  getErrorMessage: (field: string) => string;
}>();

const emit = defineEmits(['updateStrategies', 'updateNetwork', 'updateSymbol']);

const strategies = computed(() => props.form.strategies);

const strategyObj = {
  name: '',
  network: '',
  params: {}
};

const modalStrategyOpen = ref(false);
const currentStrategyIndex = ref<number | null>(null);
const currentStrategy = ref<SpaceStrategy>(clone(strategyObj));

function handleRemoveStrategy(i) {
  emit(
    'updateStrategies',
    strategies.value.filter((strategy, index) => index !== i)
  );
}

function handleEditStrategy(i) {
  currentStrategyIndex.value = i;
  currentStrategy.value = clone(strategies.value[i]);
  modalStrategyOpen.value = true;
}

function handleAddStrategy() {
  currentStrategyIndex.value = null;
  currentStrategy.value = strategyObj;
  modalStrategyOpen.value = true;
}

function handleSubmitStrategy(strategy) {
  if (currentStrategyIndex.value !== null) {
    const strategiesClone = clone(strategies.value);
    strategies[currentStrategyIndex.value] = strategy;
    emit('updateStrategies', strategiesClone);
  } else {
    emit('updateStrategies', strategies.value.concat(strategy));
  }
}
</script>

<template>
  <BaseBlock
    :title="$t('settings.strategies.label')"
    :information="$t('settings.strategies.information')"
  >
    <ContainerParallelInput class="mb-4 w-full">
      <ComboboxNetwork
        :network="form.network"
        @select="value => emit('updateNetwork', value)"
      />
      <BaseInput
        :model-value="form.symbol"
        :title="$t(`settings.symbol.label`)"
        :information="$t(`settings.symbol.information`)"
        placeholder="e.g. BAL"
        :error="getErrorMessage('symbol')"
        :max-length="schemas.space.properties.symbol.maxLength"
        @update:model-value="value => emit('updateSymbol', value)"
      />
    </ContainerParallelInput>

    <div class="mb-4 grid gap-3">
      <SettingsStrategiesBlockItem
        :strategies-form="strategies"
        @edit-strategy="i => handleEditStrategy(i)"
        @remove-strategy="i => handleRemoveStrategy(i)"
      />
    </div>

    <StrategiesBlockWarning :error="getErrorMessage('strategies')" />

    <BaseButton class="block w-full" @click="handleAddStrategy">
      {{ $t('settings.addStrategy') }}
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
