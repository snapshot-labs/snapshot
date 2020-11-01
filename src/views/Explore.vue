<template>
  <div>
    <div class="mb-4 mx-auto">
      <Container class="d-flex flex-items-center">
        <div class="flex-auto text-left">
          <UiButton class="pl-3 col-12 col-lg-4">
            <Search v-model="q" placeholder="Search" />
          </UiButton>
        </div>
        <div class="ml-3 text-right hide-sm">
          {{ _numeral(items.length) }} {{ resultsStr }}
          <a
            v-if="buttonStr"
            href="https://discord.snapshot.page"
            target="_blank"
            class="hide-md ml-3"
          >
            <UiButton>{{ buttonStr }}</UiButton>
          </a>
        </div>
      </Container>
    </div>
    <Container :slim="true">
      <div
        v-infinite-scroll="loadMore"
        infinite-scroll-distance="0"
        class="overflow-hidden"
      >
        <template v-if="route === 'strategies'">
          <BlockStrategy
            v-for="item in items.slice(0, limit)"
            :key="item.key"
            :strategy="item"
            class="mb-3"
          />
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
      </div>
    </Container>
  </div>
</template>

<script>
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import strategies from '@/helpers/strategies';
import skins from '@/helpers/skins';
import { filterStrategies, filterSkins, filterNetworks } from '@/helpers/utils';

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
      return '';
    },
    resultsStr() {
      if (this.route === 'strategies') return 'strategie(s)';
      if (this.route === 'skins') return 'skin(s)';
      if (this.route === 'networks') return 'network(s)';
      return 'result(s)';
    },
    items() {
      if (this.route === 'strategies')
        return filterStrategies(strategies, this.app.spaces, this.q);
      if (this.route === 'skins')
        return filterSkins(skins, this.app.spaces, this.q);
      if (this.route === 'networks')
        return filterNetworks(networks, this.app.spaces, this.q);
      return [];
    }
  },
  methods: {
    loadMore() {
      this.limit += 8;
    }
  }
};
</script>
