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
        <Block
          v-for="network in networks.slice(0, limit)"
          :key="network.key"
          class="mb-3"
        >
          <div class="d-flex flex-items-baseline">
            <h3>
              <a
                v-text="network.name"
                :href="network.explorer"
                target="_blank"
              />
            </h3>
            <div v-text="network.chainId" class="ml-1" />
          </div>
          <div>In {{ _numeral(network.spaces.length) }} space(s)</div>
        </Block>
      </div>
    </Container>
  </div>
</template>

<script>
import networks from '@/helpers/networks.json';

export default {
  data() {
    return {
      q: '',
      limit: 8
    };
  },
  computed: {
    networks() {
      return Object.values(networks)
        .map(network => {
          network.spaces = Object.entries(this.app.spaces)
            .filter(space => space[1].chainId === network.chainId)
            .map(space => space[0]);
          return network;
        })
        .filter(network =>
          JSON.stringify(network)
            .toLowerCase()
            .includes(this.q.toLowerCase())
        )
        .sort((a, b) => b.spaces.length - a.spaces.length);
    }
  },
  methods: {
    loadMore() {
      this.limit += 8;
    }
  }
};
</script>
