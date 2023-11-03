import { createConfig, mainnet } from 'use-wagmi';
import { createPublicClient, http } from 'viem';
import { InjectedConnector } from 'use-wagmi/connectors/injected';
import { MetaMaskConnector } from 'use-wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'use-wagmi/connectors/coinbaseWallet';
import { SafeConnector } from 'use-wagmi/connectors/safe';
import { WalletConnectConnector } from 'use-wagmi/connectors/walletConnect';

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
          `Injected (${
            typeof detectedName === 'string'
              ? detectedName
              : detectedName.join(', ')
          })`,
        shimDisconnect: true
      }
    }),
    new MetaMaskConnector({
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true
      }
    }),
    new CoinbaseWalletConnector({
      options: {
        appName: 'Snapshot'
      }
    }),
    new SafeConnector({
      options: {
        debug: false
      }
    }),
    new WalletConnectConnector({
      options: {
        projectId: 'e6454bd61aba40b786e866a69bd4c5c6'
      }
    })
  ]
});

export default config;
