export default {
  AragonGovern: {
    name: 'AragonGovern',
    author: 'Evalir',
    version: '0.1.3',
    website: 'https://aragon.org/blog/snapshot',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/aragon/logo.png',
    defaults: {
      space: {},
      proposal: {}
    }
  },
  Chainlink: {
    name: 'Chainlink Result Oracle',
    version: '0.0.1',
    author: 'mktcode',
    website: 'https://...',
    icon: 'https://...',
    defaults: {
      space: {
        network: 4,
        registry: '0xb6055D3054E8FA8CD3E622ff54D6364ce5970E31',
        oracle: {
          address: '0x443271BdE48D70118E30A4867F1A549CE23F25b9',
          job: '77e02209-5347-4f75-a61d-068a3b84c8dd'
        }
      }
    }
  },
  Charts: {
    name: 'Charts',
    author: 'zerquix18',
    version: '0.1.0',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/charts/logo.png',
    defaults: {
      space: {}
    }
  },
  CommentBox: {
    name: 'Comment Box',
    author: 'spiritbro1',
    version: '0.0.1',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/commentBox/logo.png',
    defaults: {
      space: {}
    }
  },
  GnosisImpact: {
    author: 'davidalbela',
    version: '0.0.1',
    name: 'Gnosis Impact',
    website: 'https://gnosis.io',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/gnosis/logo.png',
    defaults: {
      space: {},
      proposal: {}
    }
  },
  HAL: {
    name: 'HAL',
    author: 'hal.xyz',
    version: '1.0.0',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/hal/logo.png',
    defaults: {
      space: {}
    }
  },
  Poap: {
    name: 'Poap Module',
    author: 'Poap-xyz',
    version: '1.0.0',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/poap/logo.png',
    defaults: {
      space: {}
    }
  },
  Quorum: {
    name: 'Quorum',
    author: 'lbeder',
    version: '0.1.0',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/quorum/logo.png',
    defaults: {
      space: {}
    }
  },
  SafeSnap: {
    name: 'Gnosis SafeSnap',
    version: '1.0.0',
    author: 'Gnosis',
    website: 'https://safe.gnosis.io',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/safeSnap/logo.png',
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
  },
  Subscribe: {
    name: 'Subscribe',
    author: 'Kapp',
    version: '1.0.0',
    icon: 'https://raw.githubusercontent.com/snapshot-labs/snapshot-plugins/master/src/plugins/subscribe/logo.png',
    defaults: {
      space: {}
    }
  }
}