import injected from '@snapshot-labs/lock/connectors/injected';
import connectors from '@/helpers/connectors.json';
import torus from '@snapshot-labs/lock/connectors/torus';

const options: any = { connectors: [] };
const lockConnectors = {
  torus,
  injected
};

Object.entries(connectors).forEach((connector: any) => {
  options.connectors.push({
    key: connector[0],
    connector: lockConnectors[connector[0]],
    options: connector[1].options
  });
});

export default options;
