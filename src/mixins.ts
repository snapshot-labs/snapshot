import { mapState } from 'vuex';
import numeral from 'numeral';
import get from 'lodash/get';
import prettyMs from 'pretty-ms';
import domains from '@snapshot-labs/snapshot-spaces/spaces/domains.json';
import store from '@/store';
import config from '@/helpers/config';
import networks from '@/helpers/networks.json';

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
    _get(object, path, fb) {
      return get(object, path, fb);
    },
    _ms(number) {
      const diff = number * 1e3 - new Date().getTime();
      return prettyMs(diff);
    },
    _numeral(number, format = '(0.[00]a)') {
      return numeral(number).format(format);
    },
    _shorten(str: string, length = 6): string {
      if (!str) {
        return '';
      }

      const part0 = str.substr(0, length);
      const part1 = str.substr(length * -1);

      return `${part0}...${part1}`;
    },
    _ipfsUrl(ipfsHash: string): string {
      return `https://${process.env.VUE_APP_IPFS_NODE}/ipfs/${ipfsHash}`;
    },
    _explorer(network, str: string, type = 'address'): string {
      return `${networks[network].explorer}/${type}/${str}?network=${network}`;
    }
  }
};
