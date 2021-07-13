import Client from '@snapshot-labs/snapshot.js/src/sign';

const hubUrl: any =
  import.meta.env.VITE_APP_HUB_URL || 'https://testnet.snapshot.org';
const client = new Client(hubUrl);

export default client;
