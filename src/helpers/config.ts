import connectors from '@/helpers/connectors.json';

const config = {
  env: 'master',
  connectors
};

const domainName = window.location.hostname;
if (domainName.includes('localhost')) config.env = 'local';
if (domainName === 'demo.snapshot.page' || domainName === 'beta.snapshot.page')
  config.env = 'develop';
if (domainName === 'snapshot.page') {
  // @ts-ignore
  delete config.connectors.portis;
  // @ts-ignore
  delete config.connectors.torus;
}

export default config;
