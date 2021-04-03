import Client from '@snapshot-labs/snapshot.js/src/client';

const hubUrl = process.env.VUE_APP_HUB_URL || 'https://testnet.snapshot.org';
const client = new Client(hubUrl);

export default client;
