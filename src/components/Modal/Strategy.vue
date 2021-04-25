<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>
        {{ strategy.name ? $t('editStrategy') : $t('settings.addStrategy') }}
      </h3>
    </template>
    <Search
      v-if="!strategy.name && !input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div class="mt-4 mx-0 mx-md-4">
      <div v-if="input.name" class="p-4 mb-4 border rounded-2 text-white">
        <h4 v-text="input.name" class="mb-3 text-center" />
        <UiButton
          class="d-block width-full mb-3 overflow-x-auto"
          style="height: auto"
        >
          <TextareaAutosize
            v-model="input.params"
            :placeholder="$t('strategyParameters')"
            class="input text-left"
            style="width: 560px"
          />
        </UiButton>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          class="button--submit width-full"
        >
          {{ strategy.name ? $t('save') : $t('add') }}
        </UiButton>
      </div>
      <div v-if="!input.name">
        <a
          v-for="strategy in strategies"
          :key="strategy.key"
          @click="select(strategy.key)"
        >
          <BlockStrategy :strategy="strategy" />
        </a>
        <NoResults v-if="Object.keys(strategies).length < 1" />
      </div>
    </div>
  </UiModal>
</template>

<script>
import { clone } from '@/helpers/utils';
import { useStrategyFilter } from '@/composables/useSearchFilters';

const defaultParams = {
  symbol: 'DAI',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18
};

import { ref, toRefs, computed, watch } from 'vue';
export default {
  props: {
    open: {
      type: Boolean,
      required: true
    },
    strategy: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const searchInput = ref('');
    const input = ref({
      name: '',
      params: JSON.stringify(defaultParams, null, 2)
    });
    const { open, strategy } = toRefs(props);

    const { filteredStrategies } = useStrategyFilter();
    const strategies = computed(() => filteredStrategies(searchInput.value));

    watch(open, () => {
      if (strategy.value?.name) {
        strategy.value.params = JSON.stringify(strategy.value.params, null, 2);
        input.value = strategy.value;
      } else {
        input.value = {
          name: '',
          params: JSON.stringify(defaultParams, null, 2)
        };
      }
    });

    const isValid = computed(() => {
      try {
        const params = JSON.parse(input.value.params);
        return !!params.symbol;
      } catch (e) {
        return false;
      }
    });

    function select(strategy) {
      input.value.name = strategy;
    }

    function handleSubmit() {
      const strategy = clone(input.value);
      strategy.params = JSON.parse(strategy.params);
      emit('add', strategy);
      emit('close');
    }

    return {
      strategies,
      searchInput,
      select,
      input,
      isValid,
      handleSubmit
    };
  }
};
</script>
