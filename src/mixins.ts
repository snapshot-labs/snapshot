import { shorten, explorerUrl, n, ms } from '@/helpers/utils';
import { getUrl } from '@snapshot-labs/snapshot.js/src/utils';

export default {
  methods: {
    _explorer: explorerUrl,
    _shorten: shorten,
    _ms: ms,
    _n: n,
    _getUrl(url) {
      const gateway: any =
        import.meta.env.VITE_IPFS_GATEWAY || 'cloudflare-ipfs.com';
      return getUrl(url, gateway);
    }
  }
};
