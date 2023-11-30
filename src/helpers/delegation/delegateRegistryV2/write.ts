import { DelegationWriter } from '../delegation';
import { ExtendedSpace } from '@/helpers/interfaces';

const sendSetDelegationTx =
  (space: ExtendedSpace, auth: any): DelegationWriter['sendSetDelegationTx'] =>
  async (addresses: string[]) => {
    throw new Error('Not implemented');
  };

export const getDelegationWriter = (
  space: ExtendedSpace,
  auth: any
): DelegationWriter => {
  throw new Error('Not implemented');
};
