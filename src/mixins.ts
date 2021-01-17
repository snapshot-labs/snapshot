import { mapState } from 'vuex';
import numeral from 'numeral';
import prettyMs from 'pretty-ms';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import domains from '@snapshot-labs/snapshot-spaces/spaces/domains.json';
import store from '@/store';
import config from '@/helpers/config';
import { shorten } from '@/helpers/utils';

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);
const domainName = window.location.hostname;

export default {
  data() {
    return {
      config
    };
  },
  computed: {
    ...mapState(modules),
    domain() {
      return domains[domainName];
    }
  },
  methods: {
    _ms(number) {
      const diff = number * 1e3 - new Date().getTime();
      return prettyMs(diff);
    },
    _numeral(number, format = '(0.[00]a)') {
      return numeral(number).format(format);
    },
    _shorten(str: string, key: any): string {
      if (!str) return str;
      let limit;
      if (typeof key === 'number') limit = key;
      if (key === 'symbol') limit = 6;
      if (key === 'name') limit = 64;
      if (key === 'choice') limit = 12;
      if (limit)
        return str.length > limit ? `${str.slice(0, limit).trim()}...` : str;
      return shorten(str);
    },
    _ipfsUrl(ipfsHash: string): string {
      return `https://${process.env.VUE_APP_IPFS_GATEWAY}/ipfs/${ipfsHash}`;
    },
    _explorer(network, str: string, type = 'address'): string {
      return `${networks[network].explorer}/${type}/${str}`;
    }
  }
};
