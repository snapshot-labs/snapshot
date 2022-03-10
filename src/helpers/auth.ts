import injected from '@snapshot-labs/lock/connectors/injected';
import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';
import torus from '@snapshot-labs/lock/connectors/torus';
import portis from '@snapshot-labs/lock/connectors/portis';
import fortmatic from '@snapshot-labs/lock/connectors/fortmatic';
import connectors from '@/helpers/connectors.json';
import walletlink from '@snapshot-labs/lock/connectors/walletlink';
import gnosis from '@snapshot-labs/lock/connectors/gnosis';

const options: any = { connectors: [] };
const lockConnectors = {
  injected,
  walletconnect,
  torus,
  walletlink,
  portis,
  fortmatic,
  gnosis
};

Object.entries(connectors).forEach((connector: any) => {
  options.connectors.push({
    key: connector[0],
    connector: lockConnectors[connector[0]],
    options: connector[1].options
  });
});

export default options;
