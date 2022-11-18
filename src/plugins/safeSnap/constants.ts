import { MULTI_SEND_VERSION } from './utils/multiSend';

export const EIP712_TYPES = {
  Transaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'operation', type: 'uint8' },
    { name: 'nonce', type: 'uint256' }
  ]
};

export const EIP3770_PREFIXES = {
  1: 'eth',
  4: 'rin',
  56: 'bnb',
  100: 'gno',
  246: 'ewt',
  73799: 'vt',
  42161: 'arb1',
  137: 'matic'
};

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

export const GNOSIS_SAFE_TRANSACTION_API_URLS = {
  '1': 'https://safe-transaction.gnosis.io/api/v1/',
  '4': 'https://safe-transaction.rinkeby.gnosis.io/api/v1/',
  '100': 'https://safe-transaction.xdai.gnosis.io/api/v1/',
  '73799': 'https://safe-transaction.volta.gnosis.io/api/v1/',
  '246': 'https://safe-transaction.ewc.gnosis.io/api/v1/',
  '137': 'https://safe-transaction.polygon.gnosis.io/api/v1/',
  '56': 'https://safe-transaction.bsc.gnosis.io/api/v1/',
  '42161': 'https://safe-transaction.arbitrum.gnosis.io/api/v1/'
};

// ABIs

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
  'function executedProposalTransactions(bytes32 questionHash, bytes32 txHash) view returns (bool)',
  'function questionIds(bytes32 questionHash) view returns (bytes32)',
  'function minimumBond() view returns (uint256)',

  // Write functions
  'function addProposal(string proposalId, bytes32[] txHashes)',
  'function executeProposalWithIndex(string proposalId, bytes32[] txHashes, address to, uint256 value, bytes data, uint8 operation, uint256 txIndex)'
];

export const ORACLE_ABI = [
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

export const UMA_MODULE_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_finder", "type": "address" },
      { "internalType": "address", "name": "_owner", "type": "address" },
      { "internalType": "address", "name": "_collateral", "type": "address" },
      { "internalType": "uint256", "name": "_bondAmount", "type": "uint256" },
      { "internalType": "string", "name": "_rules", "type": "string" },
      { "internalType": "bytes32", "name": "_identifier", "type": "bytes32" },
      { "internalType": "uint64", "name": "_liveness", "type": "uint64" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousAvatar",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAvatar",
        "type": "address"
      }
    ],
    "name": "AvatarSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "guard",
        "type": "address"
      }
    ],
    "name": "ChangedGuard",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "avatar",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "target",
        "type": "address"
      }
    ],
    "name": "OptimisticGovernorDeployed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "proposalHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "status",
        "type": "bytes32"
      }
    ],
    "name": "ProposalDeleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "collateral",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "bondAmount",
        "type": "uint256"
      }
    ],
    "name": "SetBond",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "contract IERC20",
        "name": "collateral",
        "type": "address"
      }
    ],
    "name": "SetCollateral",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      }
    ],
    "name": "SetIdentifier",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint64",
        "name": "liveness",
        "type": "uint64"
      }
    ],
    "name": "SetLiveness",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "rules",
        "type": "string"
      }
    ],
    "name": "SetRules",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousTarget",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newTarget",
        "type": "address"
      }
    ],
    "name": "TargetSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "proposalHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "transactionIndex",
        "type": "uint256"
      }
    ],
    "name": "TransactionExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalTime",
        "type": "uint256"
      },
      {
        "components": [
          {
            "components": [
              { "internalType": "address", "name": "to", "type": "address" },
              {
                "internalType": "enum Enum.Operation",
                "name": "operation",
                "type": "uint8"
              },
              { "internalType": "uint256", "name": "value", "type": "uint256" },
              { "internalType": "bytes", "name": "data", "type": "bytes" }
            ],
            "internalType": "struct OptimisticGovernor.Transaction[]",
            "name": "transactions",
            "type": "tuple[]"
          },
          {
            "internalType": "uint256",
            "name": "requestTime",
            "type": "uint256"
          }
        ],
        "indexed": false,
        "internalType": "struct OptimisticGovernor.Proposal",
        "name": "proposal",
        "type": "tuple"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "proposalHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "explanation",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "challengeWindowEnds",
        "type": "uint256"
      }
    ],
    "name": "TransactionsProposed",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "PROPOSAL_HASH_KEY",
    "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PROPOSAL_VALID_RESPONSE",
    "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "avatar",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bondAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "collateral",
    "outputs": [
      { "internalType": "contract IERC20", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_proposalHash", "type": "bytes32" }
    ],
    "name": "deleteDisputedProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_proposalHash", "type": "bytes32" }
    ],
    "name": "deleteProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_proposalHash", "type": "bytes32" }
    ],
    "name": "deleteRejectedProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "to", "type": "address" },
          {
            "internalType": "enum Enum.Operation",
            "name": "operation",
            "type": "uint8"
          },
          { "internalType": "uint256", "name": "value", "type": "uint256" },
          { "internalType": "bytes", "name": "data", "type": "bytes" }
        ],
        "internalType": "struct OptimisticGovernor.Transaction[]",
        "name": "_transactions",
        "type": "tuple[]"
      }
    ],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "finder",
    "outputs": [
      {
        "internalType": "contract FinderInterface",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getGuard",
    "outputs": [
      { "internalType": "address", "name": "_guard", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "guard",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "identifier",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "liveness",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "optimisticOracle",
    "outputs": [
      {
        "internalType": "contract OptimisticOracleInterface",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "proposalHashes",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "to", "type": "address" },
          {
            "internalType": "enum Enum.Operation",
            "name": "operation",
            "type": "uint8"
          },
          { "internalType": "uint256", "name": "value", "type": "uint256" },
          { "internalType": "bytes", "name": "data", "type": "bytes" }
        ],
        "internalType": "struct OptimisticGovernor.Transaction[]",
        "name": "_transactions",
        "type": "tuple[]"
      },
      { "internalType": "bytes", "name": "_explanation", "type": "bytes" }
    ],
    "name": "proposeTransactions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rules",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_avatar", "type": "address" }
    ],
    "name": "setAvatar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "_collateral",
        "type": "address"
      },
      { "internalType": "uint256", "name": "_bondAmount", "type": "uint256" }
    ],
    "name": "setCollateralAndBond",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_guard", "type": "address" }
    ],
    "name": "setGuard",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_identifier", "type": "bytes32" }
    ],
    "name": "setIdentifier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint64", "name": "_liveness", "type": "uint64" }
    ],
    "name": "setLiveness",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_rules", "type": "string" }
    ],
    "name": "setRules",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_target", "type": "address" }
    ],
    "name": "setTarget",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes", "name": "initializeParams", "type": "bytes" }
    ],
    "name": "setUp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sync",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "target",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const UMA_ORACLE_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_liveness", "type": "uint256" },
      {
        "internalType": "address",
        "name": "_finderAddress",
        "type": "address"
      },
      { "internalType": "address", "name": "_timerAddress", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "disputer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "proposedPrice",
        "type": "int256"
      }
    ],
    "name": "DisputePrice",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "proposedPrice",
        "type": "int256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "expirationTimestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "currency",
        "type": "address"
      }
    ],
    "name": "ProposePrice",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "currency",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "finalFee",
        "type": "uint256"
      }
    ],
    "name": "RequestPrice",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "proposer",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "disputer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "price",
        "type": "int256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payout",
        "type": "uint256"
      }
    ],
    "name": "Settle",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ancillaryBytesLimit",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "defaultLiveness",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "disputePrice",
    "outputs": [
      { "internalType": "uint256", "name": "totalBond", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "disputer", "type": "address" },
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "disputePriceFor",
    "outputs": [
      { "internalType": "uint256", "name": "totalBond", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "finder",
    "outputs": [
      {
        "internalType": "contract FinderInterface",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "getRequest",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "proposer", "type": "address" },
          { "internalType": "address", "name": "disputer", "type": "address" },
          {
            "internalType": "contract IERC20",
            "name": "currency",
            "type": "address"
          },
          { "internalType": "bool", "name": "settled", "type": "bool" },
          { "internalType": "bool", "name": "refundOnDispute", "type": "bool" },
          {
            "internalType": "int256",
            "name": "proposedPrice",
            "type": "int256"
          },
          {
            "internalType": "int256",
            "name": "resolvedPrice",
            "type": "int256"
          },
          {
            "internalType": "uint256",
            "name": "expirationTime",
            "type": "uint256"
          },
          { "internalType": "uint256", "name": "reward", "type": "uint256" },
          { "internalType": "uint256", "name": "finalFee", "type": "uint256" },
          { "internalType": "uint256", "name": "bond", "type": "uint256" },
          {
            "internalType": "uint256",
            "name": "customLiveness",
            "type": "uint256"
          }
        ],
        "internalType": "struct OptimisticOracleInterface.Request",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "getState",
    "outputs": [
      {
        "internalType": "enum OptimisticOracleInterface.State",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "hasPrice",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      { "internalType": "int256", "name": "proposedPrice", "type": "int256" }
    ],
    "name": "proposePrice",
    "outputs": [
      { "internalType": "uint256", "name": "totalBond", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "proposer", "type": "address" },
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      { "internalType": "int256", "name": "proposedPrice", "type": "int256" }
    ],
    "name": "proposePriceFor",
    "outputs": [
      { "internalType": "uint256", "name": "totalBond", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      {
        "internalType": "contract IERC20",
        "name": "currency",
        "type": "address"
      },
      { "internalType": "uint256", "name": "reward", "type": "uint256" }
    ],
    "name": "requestPrice",
    "outputs": [
      { "internalType": "uint256", "name": "totalBond", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "requests",
    "outputs": [
      { "internalType": "address", "name": "proposer", "type": "address" },
      { "internalType": "address", "name": "disputer", "type": "address" },
      {
        "internalType": "contract IERC20",
        "name": "currency",
        "type": "address"
      },
      { "internalType": "bool", "name": "settled", "type": "bool" },
      { "internalType": "bool", "name": "refundOnDispute", "type": "bool" },
      { "internalType": "int256", "name": "proposedPrice", "type": "int256" },
      { "internalType": "int256", "name": "resolvedPrice", "type": "int256" },
      {
        "internalType": "uint256",
        "name": "expirationTime",
        "type": "uint256"
      },
      { "internalType": "uint256", "name": "reward", "type": "uint256" },
      { "internalType": "uint256", "name": "finalFee", "type": "uint256" },
      { "internalType": "uint256", "name": "bond", "type": "uint256" },
      { "internalType": "uint256", "name": "customLiveness", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      { "internalType": "uint256", "name": "bond", "type": "uint256" }
    ],
    "name": "setBond",
    "outputs": [
      { "internalType": "uint256", "name": "totalBond", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "time", "type": "uint256" }
    ],
    "name": "setCurrentTime",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      { "internalType": "uint256", "name": "customLiveness", "type": "uint256" }
    ],
    "name": "setCustomLiveness",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "setRefundOnDispute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "requester", "type": "address" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "settle",
    "outputs": [
      { "internalType": "uint256", "name": "payout", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "settleAndGetPrice",
    "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      { "internalType": "address", "name": "requester", "type": "address" }
    ],
    "name": "stampAncillaryData",
    "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "timerAddress",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const UMA_VOTING_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_emissionRate", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "_spamDeletionProposalBond",
        "type": "uint256"
      },
      {
        "internalType": "uint64",
        "name": "_unstakeCoolDown",
        "type": "uint64"
      },
      { "internalType": "uint64", "name": "_phaseLength", "type": "uint64" },
      {
        "internalType": "uint64",
        "name": "_minRollToNextRoundLength",
        "type": "uint64"
      },
      { "internalType": "uint256", "name": "_gat", "type": "uint256" },
      {
        "internalType": "uint64",
        "name": "_startingRequestIndex",
        "type": "uint64"
      },
      { "internalType": "address", "name": "_votingToken", "type": "address" },
      { "internalType": "address", "name": "_finder", "type": "address" },
      {
        "internalType": "address",
        "name": "_slashingLibrary",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_previousVotingContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }
    ],
    "name": "DelegateSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegator",
        "type": "address"
      }
    ],
    "name": "DelegatorSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "encryptedVote",
        "type": "bytes"
      }
    ],
    "name": "EncryptedVote",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bool",
        "name": "executed",
        "type": "bool"
      }
    ],
    "name": "ExecutedSpamDeletion",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokensSent",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "voterStake",
        "type": "uint256"
      }
    ],
    "name": "ExecutedUnstake",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newGat",
        "type": "uint256"
      }
    ],
    "name": "GatChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "priceRequestIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isGovernance",
        "type": "bool"
      }
    ],
    "name": "PriceRequestAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "priceRequestIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "price",
        "type": "int256"
      }
    ],
    "name": "PriceResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "unstakeTime",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "voterStake",
        "type": "uint256"
      }
    ],
    "name": "RequestedUnstake",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newEmissionRate",
        "type": "uint256"
      }
    ],
    "name": "SetNewEmissionRate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newUnstakeCoolDown",
        "type": "uint256"
      }
    ],
    "name": "SetNewUnstakeCoolDown",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "proposalId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256[2][]",
        "name": "spamRequestIndices",
        "type": "uint256[2][]"
      }
    ],
    "name": "SignaledRequestsAsSpamForDeletion",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newAddress",
        "type": "address"
      }
    ],
    "name": "SlashingLibraryChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newBond",
        "type": "uint256"
      }
    ],
    "name": "SpamDeletionProposalBondChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "voterStake",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "voterPendingUnstake",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cumulativeStake",
        "type": "uint256"
      }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newReward",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "lastUpdateTime",
        "type": "uint256"
      }
    ],
    "name": "UpdatedReward",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "priceRequestIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      }
    ],
    "name": "VoteCommitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "priceRequestIndex",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "identifier",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "time",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "ancillaryData",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "price",
        "type": "int256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "numTokens",
        "type": "uint256"
      }
    ],
    "name": "VoteRevealed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "slashedTokens",
        "type": "int256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "postActiveStake",
        "type": "uint256"
      }
    ],
    "name": "VoterSlashed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "newAddress",
        "type": "address"
      }
    ],
    "name": "VotingContractMigrated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokensWithdrawn",
        "type": "uint256"
      }
    ],
    "name": "WithdrawnRewards",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ANCILLARY_BYTES_LIMIT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
      { "internalType": "bytes", "name": "encryptedVote", "type": "bytes" }
    ],
    "name": "commitAndEmitEncryptedVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" }
    ],
    "name": "commitVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cumulativeStake",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentActiveRequests",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "delegateToStaker",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emissionRate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "proposalId", "type": "uint256" }
    ],
    "name": "executeSpamDeletion",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "executeUnstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gat",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentRoundId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNumberOfPriceRequests",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPendingRequests",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "identifier",
            "type": "bytes32"
          },
          { "internalType": "uint256", "name": "time", "type": "uint256" },
          { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
          {
            "internalType": "uint64",
            "name": "priceRequestIndex",
            "type": "uint64"
          }
        ],
        "internalType": "struct VotingV2Interface.PendingRequestAncillaryAugmented[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "getPrice",
    "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" }
    ],
    "name": "getPrice",
    "outputs": [{ "internalType": "int256", "name": "", "type": "int256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "identifier",
            "type": "bytes32"
          },
          { "internalType": "uint256", "name": "time", "type": "uint256" },
          { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
        ],
        "internalType": "struct VotingV2Interface.PendingRequestAncillary[]",
        "name": "requests",
        "type": "tuple[]"
      }
    ],
    "name": "getPriceRequestStatuses",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum VotingV2.RequestStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "lastVotingRound",
            "type": "uint256"
          }
        ],
        "internalType": "struct VotingV2.RequestState[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "roundId", "type": "uint256" }
    ],
    "name": "getRoundEndTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "spamDeletionRequestId",
        "type": "uint256"
      }
    ],
    "name": "getSpamDeletionRequest",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256[2][]",
            "name": "spamRequestIndices",
            "type": "uint256[2][]"
          },
          {
            "internalType": "uint256",
            "name": "requestTime",
            "type": "uint256"
          },
          { "internalType": "bool", "name": "executed", "type": "bool" },
          { "internalType": "address", "name": "proposer", "type": "address" },
          { "internalType": "uint256", "name": "bond", "type": "uint256" }
        ],
        "internalType": "struct VotingV2.SpamDeletionRequest",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotePhase",
    "outputs": [
      {
        "internalType": "enum VotingV2Interface.Phase",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "caller", "type": "address" }
    ],
    "name": "getVoterFromDelegate",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "voterAddress", "type": "address" },
      { "internalType": "uint256", "name": "roundId", "type": "uint256" }
    ],
    "name": "getVoterPendingStake",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "voterAddress", "type": "address" }
    ],
    "name": "getVoterStakePostUpdate",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" }
    ],
    "name": "hasPrice",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "hasPrice",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastUpdateTime",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "migratedAddress",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes[]", "name": "data", "type": "bytes[]" }
    ],
    "name": "multicall",
    "outputs": [
      { "internalType": "bytes[]", "name": "results", "type": "bytes[]" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "voterAddress", "type": "address" }
    ],
    "name": "outstandingRewards",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "pendingPriceRequests",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "previousVotingContract",
    "outputs": [
      {
        "internalType": "contract OracleAncillaryInterface",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "priceRequestIds",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "name": "priceRequests",
    "outputs": [
      { "internalType": "uint32", "name": "lastVotingRound", "type": "uint32" },
      { "internalType": "bool", "name": "isGovernance", "type": "bool" },
      {
        "internalType": "uint64",
        "name": "pendingRequestIndex",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "priceRequestIndex",
        "type": "uint64"
      },
      { "internalType": "uint64", "name": "time", "type": "uint64" },
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "requestGovernanceAction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
    ],
    "name": "requestPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" }
    ],
    "name": "requestPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "requestIndex", "type": "uint256" }
    ],
    "name": "requestSlashingTrackers",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "wrongVoteSlashPerToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "noVoteSlashPerToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalSlashed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalCorrectVotes",
            "type": "uint256"
          }
        ],
        "internalType": "struct VotingV2.SlashingTracker",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "requestUnstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "voterAddress", "type": "address" },
      { "internalType": "uint256", "name": "roundId", "type": "uint256" },
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "identifier",
            "type": "bytes32"
          },
          { "internalType": "uint256", "name": "time", "type": "uint256" },
          { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" }
        ],
        "internalType": "struct MinimumVotingAncillaryInterface.PendingRequestAncillary[]",
        "name": "toRetrieve",
        "type": "tuple[]"
      }
    ],
    "name": "retrieveRewardsOnMigratedVotingContract",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "identifier", "type": "bytes32" },
      { "internalType": "uint256", "name": "time", "type": "uint256" },
      { "internalType": "int256", "name": "price", "type": "int256" },
      { "internalType": "bytes", "name": "ancillaryData", "type": "bytes" },
      { "internalType": "int256", "name": "salt", "type": "int256" }
    ],
    "name": "revealVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardPerToken",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardPerTokenStored",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "rounds",
    "outputs": [
      { "internalType": "uint256", "name": "gat", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "cumulativeActiveStakeAtRound",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "delegate", "type": "address" }
    ],
    "name": "setDelegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "delegator", "type": "address" }
    ],
    "name": "setDelegator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "newEmissionRate",
        "type": "uint256"
      }
    ],
    "name": "setEmissionRate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "newGat", "type": "uint256" }
    ],
    "name": "setGat",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newVotingAddress",
        "type": "address"
      }
    ],
    "name": "setMigrated",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "NewRewardsExpirationTimeout",
        "type": "uint256"
      }
    ],
    "name": "setRewardsExpirationTimeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newSlashingLibrary",
        "type": "address"
      }
    ],
    "name": "setSlashingLibrary",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_spamDeletionProposalBond",
        "type": "uint256"
      }
    ],
    "name": "setSpamDeletionProposalBond",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint64",
        "name": "newUnstakeCoolDown",
        "type": "uint64"
      }
    ],
    "name": "setUnstakeCoolDown",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[2][]",
        "name": "spamRequestIndices",
        "type": "uint256[2][]"
      }
    ],
    "name": "signalRequestsAsSpamForDeletion",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "name": "skippedRequestIndexes",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "slashingLibrary",
    "outputs": [
      {
        "internalType": "contract SlashingLibraryInterface",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "spamDeletionProposalBond",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "stakeTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unstakeCoolDown",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "voterAddress", "type": "address" }
    ],
    "name": "updateTrackers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "voterAddress", "type": "address" },
      { "internalType": "uint256", "name": "indexTo", "type": "uint256" }
    ],
    "name": "updateTrackersRange",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voteTiming",
    "outputs": [
      { "internalType": "uint256", "name": "phaseLength", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "minRollToNextRoundLength",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "voterStakes",
    "outputs": [
      { "internalType": "uint256", "name": "stake", "type": "uint256" },
      {
        "internalType": "uint256",
        "name": "pendingUnstake",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewardsPaidPerToken",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outstandingRewards",
        "type": "uint256"
      },
      { "internalType": "int256", "name": "unappliedSlash", "type": "int256" },
      {
        "internalType": "uint64",
        "name": "nextIndexToProcess",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "unstakeRequestTime",
        "type": "uint64"
      },
      { "internalType": "address", "name": "delegate", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "votingToken",
    "outputs": [
      {
        "internalType": "contract ExpandedIERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawAndRestake",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawRewards",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const ERC20_ABI = [
  //Read functions
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint32)',
  'function symbol() view returns (string)',
  'function allowance(address owner, address spender) external view returns (uint256)',

  // Write functions
  'function approve(address spender, uint256 value) external returns (bool)',
  'function transfer(address recipient, uint256 amount) public virtual override returns (bool)'
];

export const ERC721_ABI = [
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable'
];

export const MULTI_SEND_ABI = [
  'function multiSend(bytes transactions) payable'
];

// MULTI SEND CONSTANTS

export const MULTI_SEND_V1_3_0 = {
  '1': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '3': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '4': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '10': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '28': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '42': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '5': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '56': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '69': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '100': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '122': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '123': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '137': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '246': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '288': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '588': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '1088': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '1285': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1287': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '4002': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '42161': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '42220': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '43114': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '73799': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '80001': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '333999': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1313161554': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1313161555': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761'
};
export const MULTI_SEND_V1_2_0 = {
  '1': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '4': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '42': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '5': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '88': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '100': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '246': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '73799': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185'
};
export const MULTI_SEND_V1_1_1 = {
  '1': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '4': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '5': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '42': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '88': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '100': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '246': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '73799': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD'
};
export const MULTI_SEND_VERSIONS: Record<
  MULTI_SEND_VERSION,
  Record<string, string>
> = {
  [MULTI_SEND_VERSION.V1_1_1]: MULTI_SEND_V1_1_1,
  [MULTI_SEND_VERSION.V1_2_0]: MULTI_SEND_V1_2_0,
  [MULTI_SEND_VERSION.V1_3_0]: MULTI_SEND_V1_3_0
};
