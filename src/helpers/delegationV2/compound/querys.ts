export const getDelegateQuery = (id: string): Record<string, any> => ({
  delegate: {
    __args: {
      id
    },
    id: true,
    delegatedVotes: true,
    tokenHoldersRepresentedAmount: true
  },
  governance: {
    __args: {
      id: 'GOVERNANCE'
    },
    delegatedVotes: true,
    totalTokenHolders: true,
    totalDelegates: true
  }
});

export const getDelegatesQuery = (
  first: number,
  skip: number,
  orderBy: string
): Record<string, any> => ({
  delegates: {
    __args: {
      first,
      skip,
      orderBy: orderBy ? orderBy : 'delegatedVotes',
      orderDirection: 'desc'
    },
    id: true,
    delegatedVotes: true,
    tokenHoldersRepresentedAmount: true
  },
  governance: {
    __args: {
      id: 'GOVERNANCE'
    },
    delegatedVotes: true,
    totalTokenHolders: true,
    totalDelegates: true
  }
});

export const getBalanceQuery = (id: string): Record<string, any> => ({
  tokenHolder: {
    __args: {
      id
    },
    id: true,
    tokenBalance: true
  }
});
