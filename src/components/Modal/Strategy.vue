<script setup>
import { ref, computed, toRefs, watch, defineProps, defineEmits } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { clone } from '@/helpers/utils';

const defaultParams = {
  symbol: 'DAI',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18
};

const props = defineProps({ open: Boolean, strategy: Object });

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);
const searchInput = ref('');
const input = ref({
  name: '',
  params: JSON.stringify(defaultParams, null, 2)
});

const isValid = computed(() => {
  try {
    const params = JSON.parse(input.value.params);
    return !!params.symbol;
  } catch (e) {
    return false;
  }
});

const { filteredStrategies } = useSearchFilters();
const strategies = computed(() => filteredStrategies(searchInput.value));

function handleSubmit() {
  const strategyObj = clone(input.value);
  strategyObj.params = JSON.parse(strategyObj.params);
  emit('add', strategyObj);
  emit('close');
}

watch(open, () => {
  if (props.strategy?.name) {
    const strategyObj = props.strategy;
    strategyObj.params = JSON.stringify(strategyObj.params, null, 2);
    input.value = props.strategy;
  } else {
    input.value = {
      name: '',
      params: JSON.stringify(defaultParams, null, 2)
    };
  }
});
</script>

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
      <div v-if="input.name" class="p-4 mb-4 border rounded-2 link-color">
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
          @click="input.name = strategy.key"
        >
          <BlockStrategy :strategy="strategy" />
        </a>
        <NoResults v-if="Object.keys(strategies).length < 1" />
      </div>
    </div>
  </UiModal>
</template>
