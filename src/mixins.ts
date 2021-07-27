import { mapState } from 'vuex';
import numeral from 'numeral';
import { format } from 'timeago.js';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import domains from '@snapshot-labs/snapshot-spaces/spaces/domains.json';
import store from '@/store';
import { shorten } from '@/helpers/utils';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';

const domainName = window.location.hostname;

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);

export default {
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
      if (number < 0.00001) return format.includes('%') ? '0%' : 0;
      return numeral(number).format(format);
    },
    _shorten: shorten,
    _getUrl(url) {
      const gateway = process.env.VUE_APP_IPFS_GATEWAY || 'cloudflare-ipfs.com';
      return getUrl(url, gateway);
    },
    _explorer(network, str: string, type = 'address'): string {
      return `${networks[network].explorer}/${type}/${str}`;
    }
  }
};
