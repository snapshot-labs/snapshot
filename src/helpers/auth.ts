import injected from '@snapshot-labs/lock/connectors/injected';
import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';
import torus from '@snapshot-labs/lock/connectors/torus';
import portis from '@snapshot-labs/lock/connectors/portis';
import fortmatic from '@snapshot-labs/lock/connectors/fortmatic';
import connectors from '@/helpers/connectors.json';
import walletlink from '@snapshot-labs/lock/connectors/walletlink';
import gnosis from '@snapshot-labs/lock/connectors/gnosis';
import LockConnector from '@snapshot-labs/lock/src/connector';

class KaikasConnector extends LockConnector {
  async connect() {
    let provider;
    const klaytn = window.klaytn;
    if (klaytn) {
      provider = klaytn;
      try {
        await klaytn.enable();
      } catch (e) {
        console.error(e);
        if (e.code === 4001) return;
      }
    }
    return provider;
  }

  async isLoggedIn() {
    // @ts-ignore
    const klaytn = window.klaytn;
    if (!klaytn) return false;
    if (klaytn.selectedAddress) return true;
    await new Promise(r => setTimeout(r, 400));
    return !!(klaytn.selectedAddress);
  }
}

const options: any = { connectors: [] };
const lockConnectors = {
  injected,
  walletconnect,
  torus,
  walletlink,
  portis,
  fortmatic,
  gnosis,
  trezor: injected,
  kaikas: KaikasConnector
};

Object.entries(connectors).forEach((connector: any) => {
  // TODO change this to accept Vue.js
  options.connectors.push({
    key: connector[0],
    connector: lockConnectors[connector[0]],
    options: connector[1].options
  });
});

export default options;
