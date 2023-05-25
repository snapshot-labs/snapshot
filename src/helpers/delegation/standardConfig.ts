import { DelegateWithPercent } from '@/helpers/interfaces';

export type QueryParams = {
  first: number;
  skip: number;
  id: string;
  orderBy?: string;
};

export abstract class StandardConfig {
  abstract getDelegatesQuery(params: QueryParams): Record<string, any>;
  abstract formatDelegatesResponse(
    response: Record<string, any>
  ): DelegateWithPercent[];

  abstract getDelegateQuery(id: string): Record<string, any>;
  abstract formatDelegateResponse(
    response: Record<string, any>
  ): DelegateWithPercent;

  abstract getBalanceQuery(id: string): Record<string, any>;
  abstract formatBalanceResponse(response: Record<string, any>): string;

  abstract initializeUser(address: string): DelegateWithPercent[];
  abstract getContractDelegateMethod(): { abi: string[]; action: string };
}
