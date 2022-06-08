<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useStrategies } from '@/composables/useStrategies';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import { useNetworksFilter } from '@/composables/useNetworksFilter';

const defaultParams = {
  symbol: 'DAI',
  address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  decimals: 18
};

const props = defineProps<{
  open: boolean;
  strategy: {
    name: string;
    network: string;
    params: Record<string, any>;
  };
  defaultNetwork?: string;
}>();

const emit = defineEmits(['add', 'close']);
const { open } = toRefs(props);
const searchInput = ref('');
const textAreaJsonIsValid = ref(true);
const loading = ref(false);
const input = ref({
  name: '',
  network: '',
  params: {} as Record<string, any>
});

const {
  filterStrategies,
  getStrategies,
  loadingStrategies,
  getExtendedStrategy,
  extendedStrategy,
  strategyDefinition
} = useStrategies();
const strategiesResults = computed(() => filterStrategies(searchInput.value));

const { getNetworksSpacesCount } = useNetworksFilter();

const strategyValidationErrors = computed(
  () => validateSchema(strategyDefinition.value, input.value.params) ?? []
);
const strategyIsValid = computed(() =>
  strategyValidationErrors.value === true ? true : false
);

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
    extendedStrategy.value?.examples?.[0]?.strategy?.params || defaultParams;
  input.value.params = strategyDefinition.value ? {} : params;
  loading.value = false;
}
async function editStrategy(strategyName) {
  input.value = props.strategy;
  await initStrategy(strategyName);
  loading.value = false;
}

watch(open, () => {
  input.value.network = props.defaultNetwork ?? '';
  // compute the spaces count for network ordering.
  getNetworksSpacesCount();
  if (props.open && !props.strategy?.name) getStrategies();
  if (props.strategy?.name) {
    editStrategy(props.strategy.name);
  } else {
    input.value = {
      name: '',
      network: props.defaultNetwork ?? '',
      params: defaultParams
    };
  }
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 v-text="input.name ? input.name : $t('settings.addStrategy')" />
    </template>
    <BaseSearch
      v-if="!strategy.name && !input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      modal
    />
    <div v-if="input.name" class="m-4">
      <LoadingRow v-if="loading" class="px-0" />
      <div v-else>
        <div class="min-h-[280px]">
          <AutocompleteNetwork
            v-model:input="input.network"
            :network="defaultNetwork"
          />
          <InputObject
            v-if="strategyDefinition"
            v-model="input.params"
            :definition="strategyDefinition"
            :errors="strategyValidationErrors"
          />
          <TextareaJson
            v-else
            v-model="input.params"
            v-model:is-valid="textAreaJsonIsValid"
            :placeholder="$t('strategyParameters')"
            class="input text-left"
          />
        </div>
      </div>
    </div>

    <div v-else class="my-4 mx-0 min-h-[300px] md:mx-4">
      <LoadingRow v-if="loadingStrategies" block />
      <div v-else class="space-y-3">
        <BaseStrategyItem
          :strategy="strategy"
          v-for="strategy in strategiesResults"
          :key="strategy.id"
          @click="selectStrategy(strategy.id)"
        />
        <BaseNoResults v-if="strategiesResults.length < 1" />
      </div>
    </div>
    <template v-if="input.name" v-slot:footer>
      <BaseButton
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
      </BaseButton>
    </template>
  </BaseModal>
</template>
