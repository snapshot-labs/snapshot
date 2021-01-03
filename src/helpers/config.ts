import connectors from '@/helpers/connectors.json';

const config = {
  env: 'master',
  connectors
};

const domainName = window.location.hostname;
if (domainName.includes('localhost')) config.env = 'local';
if (domainName === 'demo.snapshot.page' || domainName === 'beta.snapshot.page')
  config.env = 'develop';
// if (domainName === 'snapshot.page') delete config.connectors.torus;
delete config.connectors.portis;

export default config;
