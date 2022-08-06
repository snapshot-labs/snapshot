<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { useRoute } from 'vue-router';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { useIntl } from '@/composables/useIntl';
import { useNetworksFilter } from '@/composables/useNetworksFilter';
import { useStrategies } from '@/composables/useStrategies';
import { usePlugins } from '@/composables/usePlugins';

const { t, setPageTitle } = useI18n();
const { formatCompactNumber } = useIntl();
const route = useRoute();

const isStrategies = computed(
  () => !route.query.type || route.query.type === 'strategies'
);
const isNetworks = computed(() => route.query.type === 'networks');
const isPlugins = computed(() => route.query.type === 'plugins');

const buttonStr = computed(() => {
  if (isStrategies.value) return t('explore.createStrategy');
  if (isNetworks.value) return t('explore.addNetwork');
  if (isPlugins.value) return t('explore.createPlugin');
  return '';
});

const resultsStr = computed(() => {
  if (isStrategies.value) return t('explore.strategies');
  if (isNetworks.value) return t('explore.networks');
  if (isPlugins.value) return t('explore.plugins');
  return t('explore.results');
});

const createLink = computed(() => {
  if (isStrategies.value) return 'https://docs.snapshot.org/strategies/create';
  if (isNetworks.value) return 'https://docs.snapshot.org/networks';
  if (isPlugins.value) return 'https://docs.snapshot.org/plugins/create';
  return 'https://docs.snapshot.org/strategies/create';
});

const { filterNetworks, getNetworksSpacesCount, loadingNetworksSpacesCount } =
  useNetworksFilter();

const { filterPlugins, getPluginsSpacesCount, loadingPluginsSpacesCount } =
  usePlugins();

const { filterStrategies, getStrategies, loadingStrategies } = useStrategies();

const items = computed(() => {
  const q = route.query.q || '';
  if (isStrategies.value) return filterStrategies(q);
  if (isNetworks.value) return filterNetworks(q);
  if (isPlugins.value) return filterPlugins(q);
  return [];
});

watch(
  () => route.name,
  () => {
    if (isStrategies.value) getStrategies();
    if (isNetworks.value) getNetworksSpacesCount();
    if (isPlugins.value) getPluginsSpacesCount();
  },
  { immediate: true }
);

const loading = computed(() => {
  if (isStrategies.value) return loadingStrategies.value;
  if (isNetworks.value) return loadingNetworksSpacesCount.value;
  if (isPlugins.value) return loadingPluginsSpacesCount.value;
  return false;
});

const loadBy = 15;
const limit = ref(loadBy);

const { endElement } = useScrollMonitor(() => (limit.value += loadBy));

onMounted(() => {
  setPageTitle('page.title.explore');
});
</script>

<template>
  <BaseContainer class="mb-4 flex items-center">
    <BaseButton
      class="mr-auto w-full max-w-[420px] pl-3 pr-0 focus-within:!border-skin-link"
    >
      <TheSearchBar />
    </BaseButton>
    <div class="ml-3 hidden items-center whitespace-nowrap text-right sm:flex">
      <div class="flex flex-col">
        {{ formatCompactNumber(items.length) }} {{ resultsStr }}
      </div>

      <BaseLink
        v-if="buttonStr"
        :link="createLink"
        class="ml-3 hidden md:block"
        hide-external-icon
      >
        <BaseButton>
          {{ buttonStr }}
        </BaseButton>
      </BaseLink>
    </div>
  </BaseContainer>
  <BaseContainer :slim="true">
    <div class="overflow-hidden">
      <template v-if="isStrategies">
        <LoadingRow v-if="loadingStrategies" block />
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <router-link
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :to="`/strategy/${item.id}`"
          >
            <BaseStrategyItem :strategy="item" />
          </router-link>
        </div>
      </template>
      <template v-if="isNetworks">
        <LoadingRow v-if="loadingNetworksSpacesCount" block />
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <router-link
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :to="`/?network=${item.key}`"
          >
            <BaseNetworkItem :network="item" />
          </router-link>
        </div>
      </template>
      <template v-if="isPlugins">
        <LoadingRow v-if="loadingPluginsSpacesCount" block />
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="item in items.slice(0, limit)" :key="item.key">
            <BasePluginItem :plugin="item" />
          </div>
        </div>
      </template>
      <BaseNoResults v-if="items.length < 1 && !loading" use-block />
    </div>
  </BaseContainer>
  <div class="relative">
    <div ref="endElement" class="absolute h-[10px] w-[10px]" />
  </div>
</template>
