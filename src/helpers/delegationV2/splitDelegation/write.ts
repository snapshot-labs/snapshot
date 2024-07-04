import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { hexZeroPad } from '@ethersproject/bytes';
import { DelegationWriter } from '@/helpers/delegationV2/types';
import { ExtendedSpace } from '@/helpers/interfaces';
import { abi } from './abi';

const DELEGATION_CONTRACT = '0xDE1e8A7E184Babd9F0E3af18f40634e9Ed6F0905'; //All chains

const sendSetDelegationTx =
  (space: ExtendedSpace, auth: any): DelegationWriter['sendSetDelegationTx'] =>
  async (addresses, ratio, expirationTimestamp) => {
    const delegationContract =
      space.delegationPortal.delegationContract || DELEGATION_CONTRACT;
    console.log('sendSetDelegationTx', addresses, ratio, expirationTimestamp);
    if (addresses.length <= 0) {
      throw new Error('Delegation must have at least one delegate');
    }

    if (addresses.length !== ratio?.length) {
      throw new Error(
        'Delegation must have the same number of delegates and ratios'
      );
    }

    if (expirationTimestamp == null) {
      throw new Error('Delegation must have an expiration timestamp');
    }

    if (
      expirationTimestamp &&
      expirationTimestamp < Math.floor(Date.now() / 1000)
    ) {
      throw new Error('Delegation expiration must be in the future');
    }

    const delegations = addresses
      .map((address, index) => ({
        delegate: hexZeroPad(address, 32),
        ratio: ratio[index]
      }))
      .sort((a, b) => {
        return BigInt(a.delegate) < BigInt(b.delegate) ? -1 : 1;
      });
    console.log('delegations', delegations);
    const tx = await sendTransaction(
      auth.web3,
      delegationContract,
      abi,
      'setDelegation',
      [space.id, delegations, expirationTimestamp] //space.id should be the ENS name
    );
    return tx;
  };

const sendClearDelegationsTx =
  (
    space: ExtendedSpace,
    auth: any
  ): DelegationWriter['sendClearDelegationsTx'] =>
  async () => {
    const delegationContract =
      space.delegationPortal.delegationContract || DELEGATION_CONTRACT;
    const tx = await sendTransaction(
      auth.web3,
      delegationContract,
      abi,
      'clearDelegation',
      [space.id] //space.id should be the ENS name
    );
    return tx;
  };

export const getDelegationWriter = (
  space: ExtendedSpace,
  auth: any
): DelegationWriter => ({
  sendSetDelegationTx: sendSetDelegationTx(space, auth),
  sendClearDelegationsTx: sendClearDelegationsTx(space, auth)
});
