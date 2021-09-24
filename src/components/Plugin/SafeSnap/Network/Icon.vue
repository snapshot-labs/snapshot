<script>
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import mainnet from './mainnet.svg';
import rinkeby from './rinkeby.svg';
import xdai from './xdai.svg';
import volta from './volta.svg';
import ewc from './ewc.svg';
import polygon from './polygon.svg';
import bsc from './bsc.svg';
import arbitrum from './arbitrum.svg';

const URLS = {
  1: mainnet,
  4: rinkeby,
  100: xdai,
  73799: volta,
  246: ewc,
  137: polygon,
  56: bsc,
  42161: arbitrum
};

export default {
  props: ['network'],
  computed: {
    url() {
      return URLS[this.network];
    },
    name() {
      const { name } = networks[this.network] || {};
      return name || network;
    }
  }
};
</script>

<template>
  <img width="24" height="24" :src="url" :alt="name" />
</template>
