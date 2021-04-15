import { mapState } from 'vuex';
import numeral from 'numeral';
import { format } from 'timeago.js';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import domains from '@snapshot-labs/snapshot-spaces/spaces/domains.json';
import store from '@/store';
import { shorten } from '@/helpers/utils';

const domainName = window.location.hostname;

let env = 'master';
if (domainName.includes('localhost')) env = 'local';
if (domainName === 'demo.snapshot.org') env = 'develop';

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);

export default {
  data() {
    return {
      env
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
      return format(number * 1e3);
    },
    _n(number, format = '(0.[00]a)') {
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
