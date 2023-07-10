import injected from '@snapshot-labs/lock/connectors/injected';
import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';
import portis from '@snapshot-labs/lock/connectors/portis';
import connectors from '@/helpers/connectors';
import walletlink from '@snapshot-labs/lock/connectors/walletlink';
import gnosis from '@snapshot-labs/lock/connectors/gnosis';
import stargazer from '@snapshot-labs/lock/connectors/stargazer';
import kaikas from '@snapshot-labs/lock/connectors/kaikas';

const options: any = { connectors: [] };
const lockConnectors = {
  injected,
  walletconnect,
  walletlink,
  portis,
  stargazer,
  gnosis,
  kaikas
};

Object.entries(connectors).forEach(([connectorName, params]: [string, any]) => {
  options.connectors.push({
    key: connectorName,
    connector: lockConnectors[connectorName],
    options: params.options
  });
});

export default options;
