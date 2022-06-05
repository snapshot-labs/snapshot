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

const strategiesForm = ref<SpaceStrategy[]>(clone(props.strategies));

const strategyObj = {
  name: '',
  network: '',
  params: {}
};

const modalStrategyOpen = ref(false);
const currentStrategyIndex = ref<number | null>(null);
const currentStrategy = ref<SpaceStrategy>(clone(strategyObj));

function handleRemoveStrategy(i) {
  strategiesForm.value = strategiesForm.value.filter(
    (strategy, index) => index !== i
  );
}

function handleEditStrategy(i) {
  currentStrategyIndex.value = i;
  currentStrategy.value = clone(strategiesForm.value[i]);
  modalStrategyOpen.value = true;
}

function handleAddStrategy() {
  currentStrategyIndex.value = null;
  currentStrategy.value = strategyObj;
  modalStrategyOpen.value = true;
}

function handleSubmitAddStrategy(strategy) {
  if (currentStrategyIndex.value !== null) {
    strategiesForm.value[currentStrategyIndex.value] = strategy;
  } else {
    strategiesForm.value = strategiesForm.value.concat(strategy);
  }
}

watch(strategiesForm, () => emit('updateStrategies', strategiesForm.value));
</script>

<template>
  <BaseBlock :title="$t('settings.strategies') + '*'">
    <div v-for="(strategy, i) in strategiesForm" :key="i" class="mb-3 relative">
      <a @click="handleRemoveStrategy(i)" class="absolute p-4 right-0">
        <BaseIcon name="close" size="12" />
      </a>

      <a @click="handleEditStrategy(i)" class="p-4 block border rounded-md">
        <h4 v-text="strategy.name" />
      </a>
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
      @add="handleSubmitAddStrategy"
    />
  </teleport>
</template>
