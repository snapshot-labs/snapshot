<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3>Networks</h3>
    </template>
    <div class="mt-4 mx-0 mx-md-4">
      <a
        v-for="network in networks"
        :key="network.key"
        @click="select(network.key)"
      >
        <BlockNetwork :network="network" />
      </a>
    </div>
  </UiModal>
</template>

<script>
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { filterNetworks } from '@/helpers/utils';

export default {
  props: ['open'],
  computed: {
    networks() {
      return filterNetworks(networks, this.app.spaces, '');
    }
  },
  methods: {
    select(key) {
      this.$emit('input', key);
      this.$emit('close');
    }
  }
};
</script>
