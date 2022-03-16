<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { useStrategies } from '@/composables/useStrategies';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import { useNetworksFilter } from '@/composables/useNetworksFilter';
import { getIpfsUrl } from '@/helpers/utils';
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
const input = ref({
  name: '',
  network: '',
  params: {} as Record<string, any>
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
const { filterNetworks, getNetworksSpacesCount } = useNetworksFilter();
const searchNetwork = ref('');
const networks = computed(() => {
  return filterNetworks(searchNetwork.value).map(_n => ({
    label: _n.name,
    value: _n.key,
    option: _n
  }));
});
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
    <BaseSearch
      v-if="!strategy.name && !input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      modal
    />
    <div v-if="input.name" class="m-4">
      <RowLoading v-if="loading" class="px-0" />
      <div v-else>
        <div class="min-h-[280px]">
          <BaseAutocomplete
            :options="networks"
            v-model:value="input.network"
            v-model:search="searchNetwork"
            label="Network"
            :placeholder="$t('selectNetwork')"
            class="mb-3"
          >
            <template v-slot:option="{ option }">
              <div class="group flex items-center justify-between">
                <div class="flex items-center">
                  <img
                    class="mr-2 w-4 h-4 rounded-full"
                    :src="getIpfsUrl(option?.imageIPFS)"
                  />
                  <span v-text="option?.name" />
                </div>
                <span
                  class="h-[20px] rounded-full leading-normal text-xs text-white bg-skin-text text-center px-2"
                >
                  #{{ option?.chainId }}
                </span>
              </div>
            </template>
          </BaseAutocomplete>
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
    </div>

    <div v-else class="my-4 mx-0 md:mx-4 min-h-[300px]">
      <RowLoadingBlock v-if="loadingStrategies" />
      <div v-else class="space-y-3">
        <BlockStrategy
          :strategy="strategy"
          v-for="strategy in strategiesResults"
          :key="strategy.id"
          @click="selectStrategy(strategy.id)"
        />
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
