import { DelegationReader, DelegationWriter } from './delegation';
import * as compound from './compound';
import * as delegateRegistry2 from './delegateRegistryV2';
import { ExtendedSpace } from '../interfaces';

export enum DelegationTypes {
  COMPOUND = 'compound-governor',
  DELEGATE_REGISTRY_V2 = 'delegate-registry-v2'
}

export function setupDelegation(
  space: ExtendedSpace,
  auth?: any
): {
  reader: DelegationReader;
  writer: DelegationWriter;
} {
  if (space.delegationPortal?.delegationType === DelegationTypes.COMPOUND) {
    return {
      reader: compound.getDelegationReader(space),
      writer: compound.getDelegationWriter(space, auth)
    };
  } else if (
    space.strategies.some(
      ({ name }) => name === DelegationTypes.DELEGATE_REGISTRY_V2
    )
  ) {
    return {
      reader: delegateRegistry2.getDelegationReader(space),
      writer: delegateRegistry2.getDelegationWriter(space, auth)
    };
  } else {
    throw new Error(
      `Unsupported standard: ${space.delegationPortal.delegationType}`
    );
  }
}
