import Client from '@snapshot-labs/snapshot.js/src/client';

const relayerUrl =
  import.meta.env.VITE_RELAYER_URL || 'https://testnet.snapshot.org';
const client = new Client(relayerUrl);

export default client;
