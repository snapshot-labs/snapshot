<script setup>
import { ref, computed, toRefs, watch } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useApp } from '../../composables/useApp';

const defaultParams = {
  symbol: 'DAI',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18
};

const props = defineProps({ open: Boolean, strategy: Object });

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);
const searchInput = ref('');
const isValid = ref(true);
const input = ref({
  name: '',
  params: {}
});

const { strategies } = useApp();

const definition = computed(() => {
  return input.value.name && strategies.value[input.value.name].schema?.$ref
    ? strategies.value[input.value.name].schema.definitions.Strategy
    : false;
});

const { filteredStrategies } = useSearchFilters();
const strategiesResults = computed(() => filteredStrategies(searchInput.value));

function handleSubmit() {
  const strategyObj = clone(input.value);
  emit('add', strategyObj);
  emit('close');
}

function handleClick(strategy) {
  const params = strategy.examples[0]?.strategy?.params || defaultParams;
  input.value.name = strategy.key;
  input.value.params = definition.value ? {} : params;
}

watch(open, () => {
  if (props.strategy?.name) {
    input.value = props.strategy;
  } else {
    input.value = {
      name: '',
      params: defaultParams
    };
  }
});
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 v-text="input.name ? input.name : $t('settings.addStrategy')" />
    </template>
    <Search
      v-if="!strategy.name && !input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div v-if="input.name" class="m-4">
      <SDefaultObject
        v-if="definition"
        v-model="input.params"
        :definition="definition"
      />
      <UiButton
        v-else
        class="block w-full mb-3 overflow-x-auto"
        style="height: auto"
      >
        <TextareaJson
          v-model="input.params"
          v-model:is-valid="isValid"
          :placeholder="$t('strategyParameters')"
          class="input text-left no-scrollbar"
          style="width: 560px"
        />
      </UiButton>
    </div>
    <div v-else class="my-4 mx-0 md:mx-4">
      <a
        v-for="strategy in strategiesResults"
        :key="strategy.key"
        @click="handleClick(strategy)"
      >
        <BlockStrategy :strategy="strategy" />
      </a>
      <NoResults v-if="Object.keys(strategiesResults).length < 1" />
    </div>
    <template v-if="input.name" v-slot:footer>
      <UiButton
        @click="handleSubmit"
        :disabled="!isValid || !input.params.symbol"
        class="w-full"
        primary
      >
        {{ strategy.name ? $t('save') : $t('add') }}
      </UiButton>
    </template>
  </UiModal>
</template>
