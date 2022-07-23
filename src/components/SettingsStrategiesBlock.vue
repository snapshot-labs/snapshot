<script setup lang="ts">
import { ref, computed } from 'vue';
import { SpaceStrategy } from '@/helpers/interfaces';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
  title?: string;
  hideError?: boolean;
}>();

const { form, getErrorMessage } = useSpaceForm(props.context);

const strategies = computed(() => form.value.strategies);

const strategyObj = {
  name: '',
  network: '',
  params: {}
};

const modalStrategyOpen = ref(false);
const currentStrategyIndex = ref<number | null>(null);
const currentStrategy = ref<SpaceStrategy>(clone(strategyObj));

function handleRemoveStrategy(i) {
  form.value.strategies = strategies.value.filter(
    (strategy, index) => index !== i
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
    strategiesClone[currentStrategyIndex.value] = strategy;
    form.value.strategies = strategiesClone;
  } else {
    form.value.strategies = strategies.value.concat(strategy);
  }
}
</script>

<template>
  <BaseBlock :title="title || $t('settings.strategies.label')">
    <ContainerParallelInput class="mb-4 w-full">
      <ComboboxNetwork
        :network="form.network"
        :information="$t('settings.network.information')"
        @select="value => (form.network = value)"
      />
      <BaseInput
        v-model="form.symbol"
        :title="$t(`settings.symbol.label`)"
        :information="$t(`settings.symbol.information`)"
        placeholder="e.g. BAL"
        :error="getErrorMessage('symbol')"
        :max-length="schemas.space.properties.symbol.maxLength"
      />
    </ContainerParallelInput>

    <div class="mb-4 grid gap-3">
      <div class="flex items-center gap-1">
        <h4>{{ $t('settings.strategiesList') }}</h4>
        <IconInformationTooltip
          class="text-sm"
          :information="$t('settings.strategies.information')"
        />
      </div>
      <sub class="-mt-[10px] text-sm">
        ({{ $t('settings.votingPowerIsCumulative') }})
      </sub>
      <SettingsStrategiesBlockItem
        :strategies-form="strategies"
        @edit-strategy="i => handleEditStrategy(i)"
        @remove-strategy="i => handleRemoveStrategy(i)"
      />
    </div>

    <StrategiesBlockWarning
      v-if="!hideError"
      :error="getErrorMessage('strategies')"
    />

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
