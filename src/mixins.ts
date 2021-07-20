import { mapState } from 'vuex';
import store from '@/store';
import { shorten, explorerUrl, n, ms } from '@/helpers/utils';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);

export default {
  computed: {
    ...mapState(modules)
  },
  methods: {
    _explorer: explorerUrl,
    _shorten: shorten,
    _ipfsUrl: getUrl,
    _ms: ms,
    _n: n
  }
};
