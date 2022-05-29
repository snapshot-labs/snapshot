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
  <BaseContainer class="flex items-center mb-4">
    <BaseButton
      class="mr-auto pl-3 pr-0 w-full max-w-[420px] focus-within:!border-skin-link"
    >
      <SearchWithFilters />
    </BaseButton>
    <div class="ml-3 hidden sm:flex text-right items-center whitespace-nowrap">
      <div class="flex flex-col">
        {{ formatCompactNumber(items.length) }} {{ resultsStr }}
      </div>

      <BaseLink
        v-if="buttonStr"
        link="https://discord.gg/snapshot"
        class="hidden md:block ml-3"
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
        <LoadingRow block v-if="loadingStrategies" />
        <div
          v-else
          class="grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] md:gap-4"
        >
          <router-link
            :to="`/strategy/${item.id}`"
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            class="border-b first:border-t md:border-b-0 md:first:border-t-0"
          >
            <BlockStrategy :strategy="item" />
          </router-link>
        </div>
      </template>
      <template v-if="route.name === 'networks'">
        <LoadingRow block v-if="loadingNetworksSpacesCount" />
        <div
          v-else
          class="grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] md:gap-4"
        >
          <router-link
            :to="`/?network=${item.key}`"
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            class="border-b first:border-t md:border-b-0 md:first:border-t-0"
          >
            <BlockNetwork :network="item" />
          </router-link>
        </div>
      </template>
      <template v-if="route.name === 'plugins'">
        <LoadingRow block v-if="loadingPluginsSpacesCount" />
        <div
          v-else
          class="grid md:grid-cols-2 lg:grid-cols-3 gap-[1px] md:gap-4"
        >
          <div
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            class="border-b first:border-t md:border-b-0 md:first:border-t-0"
          >
            <BlockPlugin :plugin="item" />
          </div>
        </div>
      </template>
      <NoResults useBlock v-if="items.length < 1 && !loading" />
    </div>
  </BaseContainer>
  <div ref="endElement" />
</template>
