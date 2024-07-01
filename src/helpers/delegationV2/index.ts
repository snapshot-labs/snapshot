import {
  DelegationReader,
  DelegationWriter
} from '@/helpers/delegationV2/types';
import * as compound from '@/helpers/delegationV2/compound';
import * as splitDelegation from '@/helpers/delegationV2/splitDelegation';
import { ExtendedSpace } from '@/helpers/interfaces';

export enum DelegationTypes {
  COMPOUND = 'compound-governor',
  SPLIT_DELEGATION = 'split-delegation'
}

export function setupDelegation(
  space: ExtendedSpace,
  auth?: any
): {
  reader: DelegationReader;
  writer: DelegationWriter;
} {
  if (
    space.delegationPortal?.delegationType ===
      DelegationTypes.SPLIT_DELEGATION &&
    space.strategies.some(
      ({ name }) => name === DelegationTypes.SPLIT_DELEGATION
    )
  ) {
    return {
      reader: splitDelegation.getDelegationReader(space),
      writer: splitDelegation.getDelegationWriter(space, auth)
    };
  }

  return {
    reader: compound.getDelegationReader(space),
    writer: compound.getDelegationWriter(space, auth)
  };
}
