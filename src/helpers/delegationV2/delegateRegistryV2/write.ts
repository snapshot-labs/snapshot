import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { DelegationWriter } from '@/helpers/delegationV2/delegation';
import { ExtendedSpace } from '@/helpers/interfaces';
import { abi } from './abi';
import { hexZeroPad } from '@ethersproject/bytes';

const DELEGATION_CONTRACT = '0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905'; //All chains

const sendSetDelegationTx =
  (space: ExtendedSpace, auth: any): DelegationWriter['sendSetDelegationTx'] =>
  async (addresses, ratio, expirationTimestamp) => {
    if (addresses.length <= 0) {
      throw new Error(
        'Delegate Registry V2 delegation must have at least one delegate'
      );
    }

    if (addresses.length !== ratio?.length) {
      throw new Error(
        'Delegate Registry V2 delegation must have the same number of delegates and ratios'
      );
    }

    if (expirationTimestamp == null) {
      throw new Error(
        'Delegate Registry V2 delegation must have an expiration timestamp'
      );
    }

    if (
      expirationTimestamp &&
      expirationTimestamp < Math.floor(Date.now() / 1000)
    ) {
      throw new Error(
        'Delegate Registry V2 delegation expiration must be in the future'
      );
    }

    const delegations = addresses.map((address, index) => ({
      delegate: hexZeroPad(address, 32),
      ratio: ratio[index]
    }));
    const tx = await sendTransaction(
      auth.web3,
      DELEGATION_CONTRACT,
      abi,
      'setDelegation',
      [space.id, delegations, expirationTimestamp] //space.id should be the ENS name
    );
    return tx;
  };

export const getDelegationWriter = (
  space: ExtendedSpace,
  auth: any
): DelegationWriter => ({
  sendSetDelegationTx: sendSetDelegationTx(space, auth)
});
