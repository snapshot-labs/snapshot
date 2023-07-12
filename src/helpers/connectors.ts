const connectors = {
  injected: {
    id: 'injected',
    name: 'MetaMask'
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    network: '1',
    options: {
      projectId: 'e6454bd61aba40b786e866a69bd4c5c6',
      chains: [1],
      optionalChains: [4, 5, 10, 42, 56, 100, 137, 246, 42161, 73799],
      methods: ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4'],
      optionalMethods: ['eth_accounts'],
      rpcMap: {
        '1': `${import.meta.env.VITE_BROVIDER_URL}/1`,
        '4': `${import.meta.env.VITE_BROVIDER_URL}/4`,
        '5': `${import.meta.env.VITE_BROVIDER_URL}/5`,
        '10': `${import.meta.env.VITE_BROVIDER_URL}/10`,
        '42': `${import.meta.env.VITE_BROVIDER_URL}/42`,
        '56': `${import.meta.env.VITE_BROVIDER_URL}/56`,
        '100': `${import.meta.env.VITE_BROVIDER_URL}/100`,
        '137': `${import.meta.env.VITE_BROVIDER_URL}/137`,
        '246': `${import.meta.env.VITE_BROVIDER_URL}/246`,
        '42161': `${import.meta.env.VITE_BROVIDER_URL}/42161`,
        '73799': `${import.meta.env.VITE_BROVIDER_URL}/73799`
      },
      showQrModal: true
    },
    icon: 'ipfs://QmZRVqHpgRemw13aoovP2EaQdVtjzXRaQGQZsCLXWaNn9x'
  },
  walletlink: {
    id: 'walletlink',
    name: 'Coinbase Wallet',
    network: '1',
    options: {
      appName: 'Snapshot',
      darkMode: false,
      chainId: 1,
      ethJsonrpcUrl: `${import.meta.env.VITE_BROVIDER_URL}/1`
    },
    icon: 'ipfs://QmbJKEaeMz6qR3DmJSTxtYtrZeQPptVfnnYK72QBsvAw5q'
  },
  portis: {
    id: 'portis',
    name: 'Portis',
    network: '1',
    options: {
      dappId: '3eb93706-c71d-456b-b4eb-322ea27f7d48',
      network: 'mainnet'
    },
    icon: 'ipfs://QmNuLXa47xSrDNKRfpPNhoFTuoztvtWCcwGnPpT5MXJWMb'
  },
  stargazer: {
    id: 'stargazer',
    name: 'Stargazer',
    icon: 'ipfs://bafkreiapdizo36f3yeg7g6l46f7ahbbkyo4otufnfyqri6louysr3grpzy'
  },
  gnosis: {
    id: 'gnosis',
    name: 'Gnosis Safe',
    icon: 'ipfs://QmfJUHZLtRvadM7fvEJUWWxhS869KXXCMxPCr7TUqkwvUc',
    hidden: true
  },
  kaikas: {
    id: 'kaikas',
    name: 'Kaikas',
    icon: 'ipfs://QmXD4kkxKzXKbbBu3zAzZ279Sm91JhxCDAwSypyzxwe2Hj'
  }
};

export default connectors;
