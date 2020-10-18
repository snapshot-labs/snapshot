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
          {{ _numeral(networks.length) }} network(s)
          <a
            href="https://discord.snapshot.page"
            target="_blank"
            class="hide-md ml-3"
          >
            <UiButton>Add network</UiButton>
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
        <BlockNetwork
          v-for="network in networks.slice(0, limit)"
          :key="network.key"
          :network="network"
          class="mb-3"
        />
      </div>
    </Container>
  </div>
</template>

<script>
import networks from '@/helpers/networks.json';
import { filterNetworks } from '@/helpers/utils';

export default {
  data() {
    return {
      q: '',
      limit: 8
    };
  },
  computed: {
    networks() {
      return filterNetworks(networks, this.app.spaces, this.q);
    }
  },
  methods: {
    loadMore() {
      this.limit += 8;
    }
  }
};
</script>
