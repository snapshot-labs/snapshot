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
        <template v-if="route === 'strategies'">
          <template v-for="item in items.slice(0, limit)" :key="item.key">
            <router-link :to="`/strategy/${item.key}`">
              <BlockStrategy :strategy="item" class="mb-3" />
            </router-link>
          </template>
        </template>
        <template v-if="route === 'skins'">
          <BlockSkin
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :skin="item"
            class="mb-3"
          />
        </template>
        <template v-if="route === 'networks'">
          <BlockNetwork
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :network="item"
            class="mb-3"
          />
        </template>
        <template v-if="route === 'plugins'">
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
  infiniteScroll
} from '@/helpers/utils';

export default {
  data() {
    return {
      q: this.$route.query.q || '',
      limit: 8
    };
  },
  computed: {
    route() {
      return this.$route.name;
    },
    buttonStr() {
      if (this.route === 'strategies') return 'Create strategy';
      if (this.route === 'skins') return 'Create skin';
      if (this.route === 'networks') return 'Add network';
      if (this.route === 'plugins') return 'Create plugin';
      return '';
    },
    resultsStr() {
      if (this.route === 'strategies') return 'strategie(s)';
      if (this.route === 'skins') return 'skin(s)';
      if (this.route === 'networks') return 'network(s)';
      if (this.route === 'plugins') return 'plugin(s)';
      return 'result(s)';
    },
    items() {
      if (this.route === 'strategies')
        return filterStrategies(strategies, this.app.spaces, this.q);
      if (this.route === 'skins')
        return filterSkins(skins, this.app.spaces, this.q);
      if (this.route === 'networks')
        return filterNetworks(networks, this.app.spaces, this.q);
      if (this.route === 'plugins')
        return filterPlugins(plugins, this.app.spaces, this.q);
      return [];
    }
  },
  methods: {
    scroll: infiniteScroll
  },
  mounted() {
    this.scroll();
  }
};
</script>
