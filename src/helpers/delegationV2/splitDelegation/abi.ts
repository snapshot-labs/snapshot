export const abi = [
  {
    inputs: [{ internalType: 'string', name: 'context', type: 'string' }],
    name: 'clearDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'context', type: 'string' },
      { internalType: 'bool', name: '_optout', type: 'bool' }
    ],
    name: 'optout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'context', type: 'string' },
      {
        components: [
          { internalType: 'bytes32', name: 'delegate', type: 'bytes32' },
          { internalType: 'uint256', name: 'ratio', type: 'uint256' }
        ],
        internalType: 'struct Delegation[]',
        name: 'delegation',
        type: 'tuple[]'
      },
      {
        internalType: 'uint256',
        name: 'expirationTimestamp',
        type: 'uint256'
      }
    ],
    name: 'setDelegation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'string', name: 'context', type: 'string' },
      {
        internalType: 'uint256',
        name: 'expirationTimestamp',
        type: 'uint256'
      }
    ],
    name: 'setExpiration',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];
