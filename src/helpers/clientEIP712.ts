import Client from '@snapshot-labs/snapshot.js/src/sign';

const hubUrl = import.meta.env.VITE_HUB_URL || 'https://testnet.snapshot.org';
// @ts-ignore
const client = new Client(hubUrl);

export default client;
