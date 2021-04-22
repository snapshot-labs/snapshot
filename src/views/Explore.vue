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
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';
import strategies from '@/helpers/strategies';
import skins from '@/helpers/skins';
import {
  filterStrategies,
  filterSkins,
  filterNetworks,
  filterPlugins,
  getStrategy
} from '@/helpers/utils';
import { monitorScroll } from '@/composables/monitor-scroll';

import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import { computed, ref, onMounted } from 'vue';

export default {
  setup() {
    const { t } = useI18n({});
    const route = useRoute();
    const store = useStore();

    const routeName = computed(() => route.name);
    const spacesState = computed(() => store.state.app.spaces);
    const loadBy = 8;

    const q = ref(computed(() => route.query.q || ''));
    const limit = ref(loadBy);

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

    const minifiedSpaces = computed(() => {
      return skins.map(skin => ({
        key: skin,
        spaces: Object.entries(spacesState.value)
          .filter(space => space[1].skin === skin)
          .map(space => space[0])
      }));
    });

    const minifiedStrategies = computed(() => {
      return Object.values(strategies).map(strategy =>
        getStrategy(strategy, spacesState.value)
      );
    });

    const items = computed(() => {
      if (routeName.value === 'strategies')
        return filterStrategies(minifiedStrategies.value, q.value);
      if (routeName.value === 'skins')
        return filterSkins(minifiedSpaces.value, q.value);
      if (routeName.value === 'networks')
        return filterNetworks(networks, spacesState.value, q.value);
      if (routeName.value === 'plugins')
        return filterPlugins(plugins, spacesState.value, q.value);
      return [];
    });

    function loadMore() {
      limit.value += loadBy;
    }

    onMounted(async () => {
      monitorScroll(() => loadMore());
    });

    console.log('asdf', strategies, items.value);

    return { buttonStr, resultsStr, items, q, limit, routeName };
  }
};
</script>
