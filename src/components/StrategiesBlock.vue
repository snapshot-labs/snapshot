<script setup lang="ts">
import { ref, watch } from 'vue';
import { SpaceStrategy } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  strategies: SpaceStrategy[];
  network: string;
  error?: string | boolean;
}>();

const emit = defineEmits(['updateStrategies']);

const strategiesClone = ref<SpaceStrategy[]>(clone(props.strategies));

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

watch(strategiesClone, () => emit('updateStrategies', strategiesClone.value));
</script>

<template>
  <BaseBlock :title="$t('settings.strategies')">
    <div class="grid gap-3 mb-4">
      <StrategiesBlockItem
        :strategies-form="strategiesClone"
        @edit-strategy="i => handleEditStrategy(i)"
        @remove-strategy="i => handleRemoveStrategy(i)"
      />
    </div>

    <BaseBlock :style="`border-color: red !important`" v-if="error">
      <BaseIcon name="warning" class="mr-2 !text-red" />
      <span class="!text-red"> {{ error }}&nbsp;</span>
      <BaseLink link="https://docs.snapshot.org/spaces/create#strategies">
        {{ $t('learnMore') }}
      </BaseLink>
    </BaseBlock>

    <BaseButton @click="handleAddStrategy" class="block w-full">
      {{ $t('settings.addStrategy') }}
    </BaseButton>
  </BaseBlock>

  <teleport to="#modal">
    <ModalStrategy
      :open="modalStrategyOpen"
      :strategy="currentStrategy"
      :defaultNetwork="network"
      @close="modalStrategyOpen = false"
      @add="handleSubmitStrategy"
    />
  </teleport>
</template>
