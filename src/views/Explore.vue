<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import { setPageTitle } from '@/helpers/utils';
import { useIntl } from '@/composables/useIntl';
import { useNetworks } from '@/composables/useNetworks';

const { t } = useI18n();
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

const { filteredStrategies, filteredPlugins } = useSearchFilters();

const { filterNetworks, getNetworksSpacesCount, loadingNetworks } =
  useNetworks();

const items = computed(() => {
  const q = route.query.q || '';
  if (route.name === 'strategies') return filteredStrategies(q);
  if (route.name === 'networks') return filterNetworks(q);
  if (route.name === 'plugins') return filteredPlugins(q);
  return [];
});

watch(
  route.name,
  () => {
    if (route.name === 'networks') getNetworksSpacesCount();
  },
  { immediate: true }
);

const loadBy = 8;
const limit = ref(loadBy);

const { endElement } = useScrollMonitor(() => (limit.value += loadBy));

onMounted(() => {
  setPageTitle('page.title.explore');
});
</script>

<template>
  <div class="mt-4">
    <Container class="flex items-center mb-4">
      <UiButton class="mr-auto pl-3 pr-0 w-full max-w-[420px]">
        <SearchWithFilters />
      </UiButton>
      <div
        class="ml-3 hidden sm:flex text-right items-center whitespace-nowrap"
      >
        <div class="flex flex-col">
          {{ formatCompactNumber(items.length) }} {{ resultsStr }}
        </div>
        <a
          v-if="buttonStr"
          href="https://discord.gg/snapshot"
          target="_blank"
          class="hidden md:block ml-3"
        >
          <UiButton>{{ buttonStr }}</UiButton>
        </a>
      </div>
    </Container>
    <Container :slim="true">
      <div class="overflow-hidden">
        <template v-if="route.name === 'strategies'">
          <template v-for="item in items.slice(0, limit)" :key="item.key">
            <router-link :to="`/strategy/${item.key}`">
              <BlockStrategy :strategy="item" class="mb-3" />
            </router-link>
          </template>
        </template>
        <template v-if="route.name === 'networks'">
          <RowLoadingBlock v-if="loadingNetworks" />
          <div v-else>
            <template v-for="item in items.slice(0, limit)" :key="item.key">
              <router-link :to="`/?network=${item.key}`">
                <BlockNetwork :network="item" class="mb-3" />
              </router-link>
            </template>
          </div>
        </template>
        <template v-if="route.name === 'plugins'">
          <BlockPlugin
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :plugin="item"
            class="mb-3"
          />
        </template>
        <NoResults :block="true" v-if="Object.keys(items).length < 1" />
      </div>
    </Container>
    <div ref="endElement" />
  </div>
</template>
