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
  switch (space.delegationPortal.delegationType) {
    case DelegationTypes.COMPOUND:
      return {
        reader: compound.getDelegationReader(space),
        writer: compound.getDelegationWriter(space, auth)
      };
    case DelegationTypes.DELEGATE_REGISTRY_V2:
      return {
        reader: delegateRegistry2.getDelegationReader(space),
        writer: delegateRegistry2.getDelegationWriter(space, auth)
      };
    default:
      throw new Error(
        `Unsupported standard: ${space.delegationPortal.delegationType}`
      );
  }
}
