import { DelegateWithPercent } from '@/helpers/interfaces';
import { StandardConfig, QueryParams } from './standardConfig';

export class CompoundGovernorConfig extends StandardConfig {
  getDelegatesQuery(params: QueryParams): Record<string, any> {
    const { first, skip, orderBy, id } = params;
    return {
      delegates: {
        __args: {
          first,
          skip,
          orderBy: orderBy ? orderBy : 'delegatedVotes',
          orderDirection: 'desc',
          where: id ? { id } : {}
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
    };
  }

  formatDelegatesResponse(response: any): DelegateWithPercent[] {
    type Governance = {
      delegatedVotes: string;
      totalTokenHolders: string;
      totalDelegates: string;
    };

    type Delegate = {
      id: string;
      delegatedVotes: string;
      tokenHoldersRepresentedAmount: number;
    };

    const governanceData = response.governance as Governance;
    const delegatesData = response.delegates as Delegate[];

    return delegatesData.map(delegate => {
      const delegatorsPercentage =
        Number(delegate.tokenHoldersRepresentedAmount) /
        Number(governanceData.totalTokenHolders);
      const votesPercentage =
        Number(delegate.delegatedVotes) / Number(governanceData.delegatedVotes);

      return {
        ...delegate,
        delegatorsPercentage,
        votesPercentage,
        statement:
          Math.random() > 0.5
            ? 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero commodi error unde harum facilis eveniet fugit, ut placeat rerum officiis autem.'
            : ''
      };
    });
  }

  getDelegateQuery(id: string): Record<string, any> {
    return {
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
    };
  }

  getBalanceQuery(id: string): Record<string, any> {
    return {
      tokenHolder: {
        __args: {
          id
        },
        id: true,
        tokenBalance: true
      }
    };
  }

  formatBalanceResponse(response: any): string {
    return response.tokenHolder?.tokenBalance || '0';
  }

  formatDelegateResponse(response: any): DelegateWithPercent {
    const delegate = response.delegate;
    const governanceData = response.governance;
    const delegatorsPercentage =
      Number(delegate.tokenHoldersRepresentedAmount) /
      Number(governanceData.totalTokenHolders);
    const votesPercentage =
      Number(delegate.delegatedVotes) / Number(governanceData.delegatedVotes);

    return {
      ...{
        id: delegate.id,
        delegatedVotes: delegate?.delegatedVotes || '0',
        tokenHoldersRepresentedAmount:
          delegate?.tokenHoldersRepresentedAmount || 0
      },
      delegatorsPercentage: delegatorsPercentage || 0,
      votesPercentage: votesPercentage || 0
    };
  }

  initializeUser(address: string): DelegateWithPercent[] {
    return [
      {
        id: address,
        delegatedVotes: '0',
        tokenHoldersRepresentedAmount: 0,
        delegatorsPercentage: 0,
        votesPercentage: 0
      }
    ];
  }

  getContractDelegateMethod(): { abi: string[]; action: string } {
    return {
      abi: ['function delegate(address delegatee)'],
      action: 'delegate'
    };
  }
}
