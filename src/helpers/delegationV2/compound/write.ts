import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { DelegationWriter } from '@/helpers/delegationV2/delegation';
import { ExtendedSpace } from '@/helpers/interfaces';

const sendSetDelegationTx =
  (space: ExtendedSpace, auth: any): DelegationWriter['sendSetDelegationTx'] =>
  async (addresses: string[]) => {
    if (addresses.length !== 1) {
      throw new Error('Compound delegation only supports one delegate');
    }
    const tx = await sendTransaction(
      auth.web3,
      space.delegationPortal.delegationContract,
      ['function delegate(address delegatee)'],
      'delegate',
      [addresses[0]]
    );
    return tx;
  };

export const getDelegationWriter = (
  space: ExtendedSpace,
  auth: any
): DelegationWriter => ({
  sendSetDelegationTx: sendSetDelegationTx(space, auth)
});
