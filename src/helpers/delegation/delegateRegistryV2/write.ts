import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { DelegationWriter } from '../delegation';
import { ExtendedSpace } from '@/helpers/interfaces';
import { abi } from './abi';
import { hexZeroPad } from '@ethersproject/bytes';

const sendSetDelegationTx =
  (space: ExtendedSpace, auth: any): DelegationWriter['sendSetDelegationTx'] =>
  async (addresses, ratio, expirationTimestamp) => {
    if (addresses.length >= 0) {
      throw new Error(
        'Delegate Registry V2 delegation must have at least one delegate'
      );
    }

    if (addresses.length !== ratio?.length) {
      throw new Error(
        'Delegate Registry V2 delegation must have the same number of delegates and ratios'
      );
    }

    const delegations = addresses.map((address, index) => ({
      delegate: hexZeroPad(address, 32),
      ratio: ratio[index]
    }));

    const tx = await sendTransaction(
      auth.web3,
      space.delegationPortal.delegationContract,
      abi,
      'setDelegation',
      [space.name, delegations, expirationTimestamp]
    );
    return tx;
  };

export const getDelegationWriter = (
  space: ExtendedSpace,
  auth: any
): DelegationWriter => ({
  sendSetDelegationTx: sendSetDelegationTx(space, auth)
});
