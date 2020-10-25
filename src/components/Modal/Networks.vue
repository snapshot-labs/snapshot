<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">Networks</h3>
    <div class="mx-0 mx-md-4">
      <BlockNetwork
        v-for="network in networks"
        :key="network.key"
        :network="network"
      />
    </div>
  </UiModal>
</template>

<script>
import networks from '@/helpers/networks.json';
import { filterNetworks } from '@/helpers/utils';

export default {
  props: ['open', 'strategies', 'space'],
  data() {
    return {
      q: ''
    };
  },
  computed: {
    networks() {
      return filterNetworks(networks, this.app.spaces, this.q);
    }
  }
};
</script>
