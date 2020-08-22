import { mapState } from 'vuex';
import numeral from 'numeral';
import store from '@/store';
import config from '@/helpers/config';
import { shorten, etherscanLink } from '@/helpers/utils';

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);

export default {
  data() {
    return {
      config
    };
  },
  computed: {
    ...mapState(modules)
  },
  methods: {
    _numeral(number, format = '(0.[00]a)') {
      return numeral(number).format(format);
    },
    _shorten(str: string): string {
      return shorten(str);
    },
    _ipfsUrl(ipfsHash: string): string {
      return `https://${process.env.VUE_APP_IPFS_NODE}/ipfs/${ipfsHash}`;
    },
    _etherscanLink(str: string, type: string): string {
      return etherscanLink(str, type);
    }
  }
};
