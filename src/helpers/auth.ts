import injected from '@snapshot-labs/lock/connectors/injected';
import portis from '@snapshot-labs/lock/connectors/portis';
import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';
import walletlink from '@snapshot-labs/lock/connectors/walletlink';
import torus from '@snapshot-labs/lock/connectors/torus';
import connectors from '@/helpers/connectors.json';

const options: any = { connectors: [] };
const lockConnectors = {
  injected,
  portis,
  walletconnect,
  walletlink,
  torus
};

Object.entries(connectors).forEach((connector: any) => {
  options.connectors.push({
    key: connector[0],
    connector: lockConnectors[connector[0]],
    options: connector[1].options
  });
});

export default options;
