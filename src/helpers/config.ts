import config from '@/config.json';

config.env = 'master';
const domainName = window.location.hostname;
if (domainName.includes('localhost')) config.env = 'local';
if (domainName === 'demo.snapshot.page' || domainName === 'beta.snapshot.page')
  config.env = 'develop';
if (domainName === 'snapshot.page') {
  delete config.connectors.walletconnect;
  delete config.connectors.walletlink;
}

export default config;
