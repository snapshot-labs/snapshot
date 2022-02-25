<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useStrategies } from '@/composables/useStrategies';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';

const defaultParams = {
  symbol: 'DAI',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18
};

const props = defineProps<{
  open: boolean;
  strategy: { name: string; params: Record<string, any> };
}>();

const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);
const searchInput = ref('');
const textAreaJsonIsValid = ref(true);
const input = ref({
  name: '',
  params: {}
});
const loading = ref(false);

const {
  filterStrategies,
  getStrategies,
  loadingStrategies,
  getExtendedStrategy,
  extendedStrategy,
  strategyDefinition
} = useStrategies();

const strategiesResults = computed(() => filterStrategies(searchInput.value));

function handleSubmit() {
  const strategyObj = clone(input.value);
  emit('add', strategyObj);
  emit('close');
}

async function initStrategy(strategyName) {
  loading.value = true;
  await getExtendedStrategy(strategyName);
}

async function selectStrategy(strategyName) {
  input.value.name = strategyName;
  await initStrategy(strategyName);
  const params =
    extendedStrategy.value?.examples?.[0].strategy?.params || defaultParams;
  input.value.params = strategyDefinition.value ? {} : params;
  loading.value = false;
}

async function editStrategy(strategyName) {
  input.value = props.strategy;
  await initStrategy(strategyName);
  loading.value = false;
}

watch(open, () => {
  if (props.open && !props.strategy?.name) getStrategies();
  if (props.strategy?.name) {
    editStrategy(props.strategy.name);
  } else {
    input.value = {
      name: '',
      params: defaultParams
    };
  }
});

const strategyValidationErrors = computed(
  () => validateSchema(strategyDefinition.value, input.value.params) ?? []
);

const strategyIsValid = computed(() =>
  strategyValidationErrors.value === true ? true : false
);
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
      <RowLoading v-if="loading" class="px-0" />
      <div v-else>
        <SDefaultObject
          v-if="strategyDefinition"
          v-model="input.params"
          :definition="strategyDefinition"
          :errors="strategyValidationErrors"
        />
        <UiButton
          v-else
          class="block w-full mb-3 overflow-x-auto"
          style="height: auto"
        >
          <TextareaJson
            v-model="input.params"
            v-model:is-valid="textAreaJsonIsValid"
            :placeholder="$t('strategyParameters')"
            class="input text-left"
          />
        </UiButton>
      </div>
    </div>

    <div v-else class="my-4 mx-0 md:mx-4 min-h-[339px]">
      <RowLoadingBlock v-if="loadingStrategies" />
      <div v-else>
        <a
          v-for="strategy in strategiesResults"
          :key="strategy.id"
          @click="selectStrategy(strategy.id)"
        >
          <BlockStrategy :strategy="strategy" />
        </a>
        <NoResults v-if="strategiesResults.length < 1" />
      </div>
    </div>
    <template v-if="input.name" v-slot:footer>
      <UiButton
        @click="handleSubmit"
        :disabled="
          !textAreaJsonIsValid ||
          (strategyDefinition && !strategyIsValid) ||
          loading
        "
        class="w-full"
        primary
      >
        {{ strategy.name ? $t('save') : $t('add') }}
      </UiButton>
    </template>
  </UiModal>
</template>
