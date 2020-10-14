import connectors from '@/helpers/connectors.json';
import networks from '@/helpers/networks.json';

const config = {
  env: 'master',
  connectors,
  networks
};

const domainName = window.location.hostname;
if (domainName.includes('localhost')) config.env = 'local';
if (domainName === 'demo.snapshot.page' || domainName === 'beta.snapshot.page')
  config.env = 'develop';
if (domainName === 'snapshot.page') {
  // @ts-ignore
  delete config.connectors.portis;
}

export default config;
