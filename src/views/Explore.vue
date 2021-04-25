<template>
  <div>
    <div class="mb-4 mx-auto">
      <Container class="d-flex flex-items-center">
        <div class="flex-auto text-left">
          <UiButton class="pl-3 col-12 col-lg-4">
            <Search v-model="q" :placeholder="$t('searchPlaceholder')" />
          </UiButton>
        </div>
        <div class="ml-3 text-right hide-sm">
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
        <template v-if="routeName === 'strategies'">
          <template v-for="item in items.slice(0, limit)" :key="item.key">
            <router-link :to="`/strategy/${item.key}`">
              <BlockStrategy :strategy="item" class="mb-3" />
            </router-link>
          </template>
        </template>
        <template v-if="routeName === 'skins'">
          <BlockSkin
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :skin="item"
            class="mb-3"
          />
        </template>
        <template v-if="routeName === 'networks'">
          <BlockNetwork
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :network="item"
            class="mb-3"
          />
        </template>
        <template v-if="routeName === 'plugins'">
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
    <div id="endpage" />
  </div>
</template>

<script>
import { useScrollMonitor } from '@/composables/useScrollMonitor';
import {
  useSkinFilter,
  useStrategyFilter,
  useNetworkFilter,
  usePluginFilter
} from '@/composables/useSearchFilters';
import { routeState } from '@/composables/useRouter';

import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
export default {
  setup() {
    // Explore
    const { t } = useI18n({});
    const { routeName, routeQuery } = routeState();

    const q = ref(routeQuery.value.q || '');

    const buttonStr = computed(() => {
      if (routeName.value === 'strategies') return t('explore.createStrategy');
      if (routeName.value === 'skins') return t('explore.createSkin');
      if (routeName.value === 'networks') return t('explore.addNetwork');
      if (routeName.value === 'plugins') return t('explore.createPlugin');
      return '';
    });

    const resultsStr = computed(() => {
      if (routeName.value === 'strategies') return t('explore.strategies');
      if (routeName.value === 'skins') return t('explore.skins');
      if (routeName.value === 'networks') return t('explore.networks');
      if (routeName.value === 'plugins') return t('explore.plugins');
      return t('explore.results');
    });

    const { filteredSkins } = useSkinFilter();
    const { filteredStrategies } = useStrategyFilter();
    const { filteredNetworks } = useNetworkFilter();
    const { filteredPlugins } = usePluginFilter();

    const items = computed(() => {
      if (routeName.value === 'strategies') return filteredStrategies(q.value);
      if (routeName.value === 'skins') return filteredSkins(q.value);
      if (routeName.value === 'networks') return filteredNetworks(q.value);
      if (routeName.value === 'plugins') return filteredPlugins(q.value);
      return [];
    });

    // Scroll pagination
    const loadBy = 8;
    const limit = ref(loadBy);

    onMounted(() => {
      useScrollMonitor(() => (limit.value += loadBy));
    });

    return { buttonStr, resultsStr, items, q, limit, routeName };
  }
};
</script>
