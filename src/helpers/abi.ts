import {
  FormatTypes,
  Fragment,
  FunctionFragment,
  Interface,
  JsonFragment
} from '@ethersproject/abi';

export const REALITY_MODULE_ABI = [
  // Events
  'event ProposalQuestionCreated(bytes32 indexed questionId, string indexed proposalId)',

  // Read functions
  'function avatar() view returns (address)', // Reality Module
  'function executor() view returns (address)', // Dao Module
  'function oracle() view returns (address)',
  'function questionCooldown() view returns (uint32)',
  'function answerExpiration() view returns (uint32)',
  'function buildQuestion(string proposalId, bytes32[] txHashes) view returns (string)',
  'function getQuestionId(string question, uint256 nonce) view returns (bytes32)',
  'function executedProposalTransactions(bytes32 questionHash, bytes32 txHash) view returns (bool)',
  'function questionIds(bytes32 questionHash) view returns (bytes32)',
  'function minimumBond() view returns (uint256)',

  // Write functions
  'function addProposal(string proposalId, bytes32[] txHashes)',
  'function executeProposalWithIndex(string proposalId, bytes32[] txHashes, address to, uint256 value, bytes data, uint8 operation, uint256 txIndex)'
];

export const UMA_MODULE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_finder', type: 'address' },
      { internalType: 'address', name: '_owner', type: 'address' },
      { internalType: 'address', name: '_collateral', type: 'address' },
      { internalType: 'uint256', name: '_bondAmount', type: 'uint256' },
      { internalType: 'string', name: '_rules', type: 'string' },
      { internalType: 'bytes32', name: '_identifier', type: 'bytes32' },
      { internalType: 'uint64', name: '_liveness', type: 'uint64' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousAvatar',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAvatar',
        type: 'address'
      }
    ],
    name: 'AvatarSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'guard',
        type: 'address'
      }
    ],
    name: 'ChangedGuard',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'avatar',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'target',
        type: 'address'
      }
    ],
    name: 'OptimisticGovernorDeployed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'proposalHash',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'status',
        type: 'bytes32'
      }
    ],
    name: 'ProposalDeleted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'collateral',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'bondAmount',
        type: 'uint256'
      }
    ],
    name: 'SetBond',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'collateral',
        type: 'address'
      }
    ],
    name: 'SetCollateral',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'identifier',
        type: 'bytes32'
      }
    ],
    name: 'SetIdentifier',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint64',
        name: 'liveness',
        type: 'uint64'
      }
    ],
    name: 'SetLiveness',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'string', name: 'rules', type: 'string' }
    ],
    name: 'SetRules',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousTarget',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newTarget',
        type: 'address'
      }
    ],
    name: 'TargetSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'proposalHash',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'transactionIndex',
        type: 'uint256'
      }
    ],
    name: 'TransactionExecuted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'proposer',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'proposalTime',
        type: 'uint256'
      },
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'to', type: 'address' },
              {
                internalType: 'enum Enum.Operation',
                name: 'operation',
                type: 'uint8'
              },
              { internalType: 'uint256', name: 'value', type: 'uint256' },
              { internalType: 'bytes', name: 'data', type: 'bytes' }
            ],
            internalType: 'struct OptimisticGovernor.Transaction[]',
            name: 'transactions',
            type: 'tuple[]'
          },
          { internalType: 'uint256', name: 'requestTime', type: 'uint256' }
        ],
        indexed: false,
        internalType: 'struct OptimisticGovernor.Proposal',
        name: 'proposal',
        type: 'tuple'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'proposalHash',
        type: 'bytes32'
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'explanation',
        type: 'bytes'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'challengeWindowEnds',
        type: 'uint256'
      }
    ],
    name: 'TransactionsProposed',
    type: 'event'
  },
  {
    inputs: [],
    name: 'PROPOSAL_HASH_KEY',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'PROPOSAL_VALID_RESPONSE',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'avatar',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'bondAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'collateral',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_proposalHash', type: 'bytes32' }
    ],
    name: 'deleteDisputedProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_proposalHash', type: 'bytes32' }
    ],
    name: 'deleteProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_proposalHash', type: 'bytes32' }
    ],
    name: 'deleteRejectedProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          {
            internalType: 'enum Enum.Operation',
            name: 'operation',
            type: 'uint8'
          },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' }
        ],
        internalType: 'struct OptimisticGovernor.Transaction[]',
        name: '_transactions',
        type: 'tuple[]'
      }
    ],
    name: 'executeProposal',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'finder',
    outputs: [
      { internalType: 'contract FinderInterface', name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getGuard',
    outputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'guard',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'identifier',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'liveness',
    outputs: [{ internalType: 'uint64', name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'optimisticOracle',
    outputs: [
      {
        internalType: 'contract OptimisticOracleInterface',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'proposalHashes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          {
            internalType: 'enum Enum.Operation',
            name: 'operation',
            type: 'uint8'
          },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' }
        ],
        internalType: 'struct OptimisticGovernor.Transaction[]',
        name: '_transactions',
        type: 'tuple[]'
      },
      { internalType: 'bytes', name: '_explanation', type: 'bytes' }
    ],
    name: 'proposeTransactions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'rules',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_avatar', type: 'address' }],
    name: 'setAvatar',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'contract IERC20', name: '_collateral', type: 'address' },
      { internalType: 'uint256', name: '_bondAmount', type: 'uint256' }
    ],
    name: 'setCollateralAndBond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    name: 'setGuard',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_identifier', type: 'bytes32' }],
    name: 'setIdentifier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint64', name: '_liveness', type: 'uint64' }],
    name: 'setLiveness',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'string', name: '_rules', type: 'string' }],
    name: 'setRules',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_target', type: 'address' }],
    name: 'setTarget',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'initializeParams', type: 'bytes' }
    ],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'sync',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'target',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

export const TELLOR_MODULE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_avatar', type: 'address' },
      { internalType: 'address', name: '_target', type: 'address' },
      {
        internalType: 'address payable',
        name: '_tellorAddress',
        type: 'address'
      },
      { internalType: 'uint32', name: '_cooldown', type: 'uint32' },
      { internalType: 'uint32', name: '_expiration', type: 'uint32' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousAvatar',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAvatar',
        type: 'address'
      }
    ],
    name: 'AvatarSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'guard',
        type: 'address'
      }
    ],
    name: 'ChangedGuard',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'queryId',
        type: 'bytes32'
      },
      {
        indexed: true,
        internalType: 'string',
        name: 'proposalId',
        type: 'string'
      }
    ],
    name: 'ProposalAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousTarget',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newTarget',
        type: 'address'
      }
    ],
    name: 'TargetSet',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'initiator',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'avatar',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'target',
        type: 'address'
      }
    ],
    name: 'TellorModuleSetup',
    type: 'event'
  },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR_TYPEHASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'INVALIDATED',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'TRANSACTION_TYPEHASH',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: '_proposalId', type: 'string' },
      { internalType: 'bytes32[]', name: '_txHashes', type: 'bytes32[]' }
    ],
    name: 'addProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'avatar',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: '_proposalId', type: 'string' },
      { internalType: 'bytes32[]', name: '_txHashes', type: 'bytes32[]' }
    ],
    name: 'buildProposal',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [],
    name: 'cooldown',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: '_proposalId', type: 'string' },
      { internalType: 'bytes32[]', name: '_txHashes', type: 'bytes32[]' },
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_value', type: 'uint256' },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
      { internalType: 'enum Enum.Operation', name: '_operation', type: 'uint8' }
    ],
    name: 'executeProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: '_proposalId', type: 'string' },
      { internalType: 'bytes32[]', name: '_txHashes', type: 'bytes32[]' },
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_value', type: 'uint256' },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
      {
        internalType: 'enum Enum.Operation',
        name: '_operation',
        type: 'uint8'
      },
      { internalType: 'uint256', name: '_txIndex', type: 'uint256' }
    ],
    name: 'executeProposalWithIndex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '', type: 'bytes32' },
      { internalType: 'bytes32', name: '', type: 'bytes32' }
    ],
    name: 'executedProposalTransactions',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getChainId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_queryId', type: 'bytes32' }],
    name: 'getCurrentValue',
    outputs: [
      { internalType: 'bool', name: '_ifRetrieve', type: 'bool' },
      { internalType: 'bytes', name: '_value', type: 'bytes' },
      { internalType: 'uint256', name: '_timestampRetrieved', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_queryId', type: 'bytes32' },
      { internalType: 'uint256', name: '_timestamp', type: 'uint256' }
    ],
    name: 'getDataBefore',
    outputs: [
      { internalType: 'bool', name: '_ifRetrieve', type: 'bool' },
      { internalType: 'bytes', name: '_value', type: 'bytes' },
      { internalType: 'uint256', name: '_timestampRetrieved', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getGuard',
    outputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_queryId', type: 'bytes32' },
      { internalType: 'uint256', name: '_timestamp', type: 'uint256' }
    ],
    name: 'getIndexForDataBefore',
    outputs: [
      { internalType: 'bool', name: '_found', type: 'bool' },
      { internalType: 'uint256', name: '_index', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '_queryId', type: 'bytes32' }],
    name: 'getNewValueCountbyQueryId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'string', name: '_proposalId', type: 'string' }],
    name: 'getQueryId',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_queryId', type: 'bytes32' },
      { internalType: 'uint256', name: '_index', type: 'uint256' }
    ],
    name: 'getTimestampbyQueryIdandIndex',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '_to', type: 'address' },
      { internalType: 'uint256', name: '_value', type: 'uint256' },
      { internalType: 'bytes', name: '_data', type: 'bytes' },
      {
        internalType: 'enum Enum.Operation',
        name: '_operation',
        type: 'uint8'
      },
      { internalType: 'uint256', name: '_nonce', type: 'uint256' }
    ],
    name: 'getTransactionHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'guard',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_queryId', type: 'bytes32' },
      { internalType: 'uint256', name: '_timestamp', type: 'uint256' }
    ],
    name: 'isInDispute',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_proposalHash', type: 'bytes32' }
    ],
    name: 'markProposalWithExpiredResultAsInvalid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'queryIds',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'resultExpiration',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: '_queryId', type: 'bytes32' },
      { internalType: 'uint256', name: '_timestamp', type: 'uint256' }
    ],
    name: 'retrieveData',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_avatar', type: 'address' }],
    name: 'setAvatar',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_guard', type: 'address' }],
    name: 'setGuard',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '_target', type: 'address' }],
    name: 'setTarget',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes', name: '_initParams', type: 'bytes' }],
    name: 'setUp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'target',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'tellor',
    outputs: [{ internalType: 'contract ITellor', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

export const REALITY_ORACLE_ABI = [
  // Events
  `event LogNewAnswer(
    bytes32 answer,
    bytes32 indexed question_id,
    bytes32 history_hash,
    address indexed user,
    uint256 bond,
    uint256 ts,
    bool is_commitment
  )`,

  // Read functions
  'function resultFor(bytes32 question_id) view returns (bytes32)',
  'function getFinalizeTS(bytes32 question_id) view returns (uint32)',
  'function getBond(bytes32 question_id) view returns (uint256)',
  'function getBestAnswer(bytes32 question_id) view returns (uint32)',
  'function balanceOf(address) view returns (uint256)',
  'function getHistoryHash(bytes32 question_id) view returns (bytes32)',
  'function isFinalized(bytes32 question_id) view returns (bool)',
  'function token() view returns (address)',

  // Write functions
  'function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) external payable',
  'function submitAnswerERC20(bytes32 question_id, bytes32 answer, uint256 max_previous, uint256 tokens) external',
  `function claimMultipleAndWithdrawBalance(
    bytes32[] question_ids,
    uint256[] lengths,
    bytes32[] hist_hashes,
    address[] addrs,
    uint256[] bonds,
    bytes32[] answers
  ) public`,
  'function withdraw() public'
];

export const UMA_ORACLE_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: '_liveness', type: 'uint256' },
      { internalType: 'address', name: '_finderAddress', type: 'address' },
      { internalType: 'address', name: '_timerAddress', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'requester',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'proposer',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'disputer',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'identifier',
        type: 'bytes32'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'ancillaryData',
        type: 'bytes'
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'proposedPrice',
        type: 'int256'
      }
    ],
    name: 'DisputePrice',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'requester',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'proposer',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'identifier',
        type: 'bytes32'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'ancillaryData',
        type: 'bytes'
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'proposedPrice',
        type: 'int256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'expirationTimestamp',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'currency',
        type: 'address'
      }
    ],
    name: 'ProposePrice',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'requester',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'identifier',
        type: 'bytes32'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'ancillaryData',
        type: 'bytes'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'currency',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reward',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'finalFee',
        type: 'uint256'
      }
    ],
    name: 'RequestPrice',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'requester',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'proposer',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'disputer',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'identifier',
        type: 'bytes32'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'ancillaryData',
        type: 'bytes'
      },
      { indexed: false, internalType: 'int256', name: 'price', type: 'int256' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'payout',
        type: 'uint256'
      }
    ],
    name: 'Settle',
    type: 'event'
  },
  {
    inputs: [],
    name: 'OO_ANCILLARY_DATA_LIMIT',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'TOO_EARLY_RESPONSE',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'ancillaryBytesLimit',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'defaultLiveness',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'disputePrice',
    outputs: [{ internalType: 'uint256', name: 'totalBond', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'disputer', type: 'address' },
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'disputePriceFor',
    outputs: [{ internalType: 'uint256', name: 'totalBond', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'finder',
    outputs: [
      { internalType: 'contract FinderInterface', name: '', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getCurrentTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'getRequest',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'proposer', type: 'address' },
          { internalType: 'address', name: 'disputer', type: 'address' },
          {
            internalType: 'contract IERC20',
            name: 'currency',
            type: 'address'
          },
          { internalType: 'bool', name: 'settled', type: 'bool' },
          {
            components: [
              { internalType: 'bool', name: 'eventBased', type: 'bool' },
              { internalType: 'bool', name: 'refundOnDispute', type: 'bool' },
              {
                internalType: 'bool',
                name: 'callbackOnPriceProposed',
                type: 'bool'
              },
              {
                internalType: 'bool',
                name: 'callbackOnPriceDisputed',
                type: 'bool'
              },
              {
                internalType: 'bool',
                name: 'callbackOnPriceSettled',
                type: 'bool'
              },
              { internalType: 'uint256', name: 'bond', type: 'uint256' },
              {
                internalType: 'uint256',
                name: 'customLiveness',
                type: 'uint256'
              }
            ],
            internalType: 'struct OptimisticOracleV2Interface.RequestSettings',
            name: 'requestSettings',
            type: 'tuple'
          },
          { internalType: 'int256', name: 'proposedPrice', type: 'int256' },
          { internalType: 'int256', name: 'resolvedPrice', type: 'int256' },
          { internalType: 'uint256', name: 'expirationTime', type: 'uint256' },
          { internalType: 'uint256', name: 'reward', type: 'uint256' },
          { internalType: 'uint256', name: 'finalFee', type: 'uint256' }
        ],
        internalType: 'struct OptimisticOracleV2Interface.Request',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'getState',
    outputs: [
      {
        internalType: 'enum OptimisticOracleV2Interface.State',
        name: '',
        type: 'uint8'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'hasPrice',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' },
      { internalType: 'int256', name: 'proposedPrice', type: 'int256' }
    ],
    name: 'proposePrice',
    outputs: [{ internalType: 'uint256', name: 'totalBond', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'proposer', type: 'address' },
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' },
      { internalType: 'int256', name: 'proposedPrice', type: 'int256' }
    ],
    name: 'proposePriceFor',
    outputs: [{ internalType: 'uint256', name: 'totalBond', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' },
      { internalType: 'contract IERC20', name: 'currency', type: 'address' },
      { internalType: 'uint256', name: 'reward', type: 'uint256' }
    ],
    name: 'requestPrice',
    outputs: [{ internalType: 'uint256', name: 'totalBond', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'requests',
    outputs: [
      { internalType: 'address', name: 'proposer', type: 'address' },
      { internalType: 'address', name: 'disputer', type: 'address' },
      { internalType: 'contract IERC20', name: 'currency', type: 'address' },
      { internalType: 'bool', name: 'settled', type: 'bool' },
      {
        components: [
          { internalType: 'bool', name: 'eventBased', type: 'bool' },
          { internalType: 'bool', name: 'refundOnDispute', type: 'bool' },
          {
            internalType: 'bool',
            name: 'callbackOnPriceProposed',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'callbackOnPriceDisputed',
            type: 'bool'
          },
          {
            internalType: 'bool',
            name: 'callbackOnPriceSettled',
            type: 'bool'
          },
          { internalType: 'uint256', name: 'bond', type: 'uint256' },
          { internalType: 'uint256', name: 'customLiveness', type: 'uint256' }
        ],
        internalType: 'struct OptimisticOracleV2Interface.RequestSettings',
        name: 'requestSettings',
        type: 'tuple'
      },
      { internalType: 'int256', name: 'proposedPrice', type: 'int256' },
      { internalType: 'int256', name: 'resolvedPrice', type: 'int256' },
      { internalType: 'uint256', name: 'expirationTime', type: 'uint256' },
      { internalType: 'uint256', name: 'reward', type: 'uint256' },
      { internalType: 'uint256', name: 'finalFee', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' },
      { internalType: 'uint256', name: 'bond', type: 'uint256' }
    ],
    name: 'setBond',
    outputs: [{ internalType: 'uint256', name: 'totalBond', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' },
      { internalType: 'bool', name: 'callbackOnPriceProposed', type: 'bool' },
      { internalType: 'bool', name: 'callbackOnPriceDisputed', type: 'bool' },
      { internalType: 'bool', name: 'callbackOnPriceSettled', type: 'bool' }
    ],
    name: 'setCallbacks',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'time', type: 'uint256' }],
    name: 'setCurrentTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' },
      { internalType: 'uint256', name: 'customLiveness', type: 'uint256' }
    ],
    name: 'setCustomLiveness',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'setEventBased',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'setRefundOnDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'requester', type: 'address' },
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'settle',
    outputs: [{ internalType: 'uint256', name: 'payout', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'identifier', type: 'bytes32' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' }
    ],
    name: 'settleAndGetPrice',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'ancillaryData', type: 'bytes' },
      { internalType: 'address', name: 'requester', type: 'address' }
    ],
    name: 'stampAncillaryData',
    outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    stateMutability: 'pure',
    type: 'function'
  },
  {
    inputs: [],
    name: 'timerAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
];

export const ERC20_ABI = [
  //Read functions
  'function name() view returns (string)',
  'function decimals() view returns (uint32)',
  'function symbol() view returns (string)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',

  // Write functions
  'function approve(address spender, uint256 value) external returns (bool)',
  'function transfer(address recipient, uint256 amount) public virtual override returns (bool)'
];

export const ERC721_ABI = [
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable'
];

export const EXPLORER_API_URLS = {
  '1': 'https://api.etherscan.io/api',
  '4': 'https://api-rinkeby.etherscan.io/api',
  '100': 'https://blockscout.com/xdai/mainnet/api',
  '73799': 'https://volta-explorer.energyweb.org/api',
  '246': 'https://explorer.energyweb.org/api',
  '137': 'https://api.polygonscan.com/api',
  '56': 'https://api.bscscan.com/api',
  '42161': 'https://api.arbiscan.io/api'
};

export type ABI = string | Array<Fragment | JsonFragment | string>;

export function isArrayParameter(parameter: string): boolean {
  return ['tuple', 'array'].includes(parameter);
}

const fetchContractABI = async (url: string, contractAddress: string) => {
  const params = new URLSearchParams({
    module: 'contract',
    action: 'getAbi',
    address: contractAddress
  });

  // TODO: needs API key or memoization
  const response = await fetch(`${url}?${params}`);

  if (!response.ok) {
    return { status: 0, result: '' };
  }

  return response.json();
};

export function parseMethodToABI(method: FunctionFragment) {
  return [method.format(FormatTypes.full)];
}

export async function getContractABI(
  network: string,
  contractAddress: string
): Promise<string> {
  const apiUrl = EXPLORER_API_URLS[network];

  if (!apiUrl) {
    console.error(`No explorer URL for network ${network}.`);
    return '';
  }

  try {
    const { result, status } = await fetchContractABI(apiUrl, contractAddress);

    if (status === '0') {
      return '';
    }

    return result;
  } catch (e) {
    console.error('Failed to retrieve ABI', e);
    return '';
  }
}

function isWriteFunction(method: FunctionFragment) {
  if (!method.stateMutability) return true;
  return !['view', 'pure'].includes(method.stateMutability);
}

export function getABIWriteFunctions(abi: string | Fragment[]) {
  const abiInterface = new Interface(abi);
  return (
    abiInterface.fragments
      // Return only contract's functions
      .filter(FunctionFragment.isFunctionFragment)
      .map(FunctionFragment.fromObject)
      // Return only write functions
      .filter(isWriteFunction)
      // Sort by name
      .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
  );
}

export function getAbiFirstFunctionName(abi: ABI): string {
  const abiInterface = new Interface(abi);
  return abiInterface.fragments[0].name;
}

export async function fetchTextSignatures(
  methodSignature: string
): Promise<string[]> {
  const url = new URL('/api/v1/signatures', 'https://www.4byte.directory');
  url.searchParams.set('hex_signature', methodSignature);
  url.searchParams.set('ordering', 'created_at');
  const response = await fetch(url.toString());
  const { results } = await response.json();
  return results.map(signature => signature.text_signature);
}
