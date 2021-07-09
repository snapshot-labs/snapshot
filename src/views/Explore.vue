<template>
  <div>
    <div class="mb-4 mx-auto">
      <Container class="d-flex flex-items-center">
        <div class="flex-auto text-left col-lg-8">
          <UiButton class="pl-3 col-12 col-lg-7 pr-0">
            <SearchWithFilters />
          </UiButton>
        </div>
        <div class="ml-3 text-right hide-sm col-lg-4">
          {{ _n(items.length) }} {{ resultsStr }}
          <a
            v-if="buttonStr"
            href="https://discord.snapshot.org"
            target="_blank"
            class="hide-md ml-3"
          >
            <UiButton>{{ buttonStr }}</UiButton>
          </a>
        </div>
      </Container>
    </div>
    <Container :slim="true">
      <div class="overflow-hidden">
        <template v-if="route.name === 'strategies'">
          <template v-for="item in items.slice(0, limit)" :key="item.key">
            <router-link :to="`/strategy/${item.key}`">
              <BlockStrategy :strategy="item" class="mb-3" />
            </router-link>
          </template>
        </template>
        <template v-if="route.name === 'skins'">
          <BlockSkin
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :skin="item"
            class="mb-3"
          />
        </template>
        <template v-if="route.name === 'networks'">
          <template v-for="item in items.slice(0, limit)" :key="item.key">
            <router-link :to="`/?network=${item.key}`">
              <BlockNetwork :network="item" class="mb-3" />
            </router-link>
          </template>
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
    <div id="endofpage" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { useScrollMonitor } from '@/composables/useScrollMonitor';

const { t } = useI18n();
const route = useRoute();

// Explore
const buttonStr = computed(() => {
  if (route.name === 'strategies') return t('explore.createStrategy');
  if (route.name === 'skins') return t('explore.createSkin');
  if (route.name === 'networks') return t('explore.addNetwork');
  if (route.name === 'plugins') return t('explore.createPlugin');
  return '';
});

const resultsStr = computed(() => {
  if (route.name === 'strategies') return t('explore.strategies');
  if (route.name === 'skins') return t('explore.skins');
  if (route.name === 'networks') return t('explore.networks');
  if (route.name === 'plugins') return t('explore.plugins');
  return t('explore.results');
});

const { filteredSkins, filteredStrategies, filteredNetworks, filteredPlugins } =
  useSearchFilters();

const items = computed(() => {
  const q = route.query.q || '';
  if (route.name === 'strategies') return filteredStrategies(q);
  if (route.name === 'skins') return filteredSkins(q);
  if (route.name === 'networks') return filteredNetworks(q);
  if (route.name === 'plugins') return filteredPlugins(q);
  return [];
});

// Scroll
const loadBy = 8;
const limit = ref(loadBy);

useScrollMonitor(() => (limit.value += loadBy));
</script>
