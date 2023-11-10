import { createConfig, mainnet } from 'use-wagmi';
import { createPublicClient, http } from 'viem';
import { InjectedConnector } from 'use-wagmi/connectors/injected';
import { CoinbaseWalletConnector } from 'use-wagmi/connectors/coinbaseWallet';
import { WalletConnectConnector } from 'use-wagmi/connectors/walletConnect';
import { SafeConnector } from 'use-wagmi/connectors/safe';

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http()
  }),
  connectors: [
    new InjectedConnector({
      options: {
        name: detectedName =>
          typeof detectedName === 'string'
            ? detectedName
            : detectedName.join(', '),
        shimDisconnect: true
      }
    }),
    new CoinbaseWalletConnector({
      options: {
        appName: 'Snapshot'
      }
    }),
    new WalletConnectConnector({
      options: {
        projectId: 'e6454bd61aba40b786e866a69bd4c5c6'
      }
    }),
    new SafeConnector({
      options: {
        debug: false
      }
    })
  ]
});

export default config;
