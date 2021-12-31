export default {
  Chainlink: {
    name: "Chainlink Result Oracle",
    version: "0.0.1",
    author: "mktcode",
    website: 'https://...',
    icon: 'https://...',
    defaults: {
      space: {
        registry: '0x123'
      },
      proposal: {
        oracles: ['0xAbc']
      }
    }
  },
  SafeSnap: {
    name: "Gnosis SafeSnap",
    version: "1.0.0",
    author: "Gnosis",
    website: 'https://safe.gnosis.io',
    icon: 'https://...',
    defaults: {
      space: {
        safes: ['0x123'],
        oracles: ['0x456']
      },
      proposal: {
        safe: '0xAbc',
        oracle: '0x456',
        tx: {}
      }
    }
  }
}