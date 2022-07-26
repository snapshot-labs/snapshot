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

const buttonStr = computed(() => {
  if (route.name === 'strategies') return t('explore.createStrategy');
  if (route.name === 'networks') return t('explore.addNetwork');
  if (route.name === 'plugins') return t('explore.createPlugin');
  return '';
});

const resultsStr = computed(() => {
  if (route.name === 'strategies') return t('explore.strategies');
  if (route.name === 'networks') return t('explore.networks');
  if (route.name === 'plugins') return t('explore.plugins');
  return t('explore.results');
});

const createLink = computed(() => {
  if (route.name === 'strategies')
    return 'https://docs.snapshot.org/strategies/create';
  if (route.name === 'networks') return 'https://docs.snapshot.org/networks';
  if (route.name === 'plugins')
    return 'https://docs.snapshot.org/plugins/create';
  return 'https://docs.snapshot.org/strategies/create';
});

const { filterNetworks, getNetworksSpacesCount, loadingNetworksSpacesCount } =
  useNetworksFilter();

const { filterPlugins, getPluginsSpacesCount, loadingPluginsSpacesCount } =
  usePlugins();

const { filterStrategies, getStrategies, loadingStrategies } = useStrategies();

const items = computed(() => {
  const q = route.query.q || '';
  if (route.name === 'strategies') return filterStrategies(q);
  if (route.name === 'networks') return filterNetworks(q);
  if (route.name === 'plugins') return filterPlugins(q);
  return [];
});

watch(
  () => route.name,
  () => {
    if (route.name === 'networks') getNetworksSpacesCount();
    if (route.name === 'plugins') getPluginsSpacesCount();
    if (route.name === 'strategies') getStrategies();
  },
  { immediate: true }
);

const loading = computed(() => {
  if (route.name === 'strategies') return loadingStrategies.value;
  if (route.name === 'networks') return loadingNetworksSpacesCount.value;
  if (route.name === 'plugins') return loadingPluginsSpacesCount.value;
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
      <template v-if="route.name === 'strategies'">
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
      <template v-if="route.name === 'networks'">
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
      <template v-if="route.name === 'plugins'">
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
  <div ref="endElement" />
</template>
