import injected from '@snapshot-labs/lock/connectors/injected';
import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';
import portis from '@snapshot-labs/lock/connectors/portis';
import connectors from '@/helpers/connectors.json';
import walletlink from '@snapshot-labs/lock/connectors/walletlink';
import gnosis from '@snapshot-labs/lock/connectors/gnosis';
import stargazer from '@snapshot-labs/lock/connectors/stargazer';

const options: any = { connectors: [] };
const lockConnectors = {
  injected,
  walletconnect,
  walletlink,
  portis,
  stargazer,
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
