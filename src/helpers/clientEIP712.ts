import Client from '@snapshot-labs/snapshot.js/src/sign';

const hubUrl = import.meta.env.VITE_HUB_URL || 'https://testnet.snapshot.org';
const relayerURL = import.meta.env.VITE_RELAYER_URL;
const client = new Client(hubUrl, { relayerURL });

export default client;
