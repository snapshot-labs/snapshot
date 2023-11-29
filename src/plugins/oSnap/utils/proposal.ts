import { BigNumber } from '@ethersproject/bignumber';
import { toUtf8Bytes } from '@ethersproject/strings';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { ERC20_ABI, OPTIMISTIC_GOVERNOR_ABI } from '../constants';
import { OptimisticGovernorTransaction } from '../types';

/**
 * The user must approve the spend of the collateral token before they can submit a proposal.
 *
 * If the proposal is disputed and fails a vote, the user will lose their bond.
 */
export async function* approveBond(
  web3: any,
  moduleAddress: string,
  collateralAddress: string,
  minimumBond: BigNumber
) {
  const approveTx = await sendTransaction(
    web3,
    collateralAddress,
    ERC20_ABI as any,
    'approve',
    [moduleAddress, minimumBond],
    {}
  );
  yield approveTx;
  const approvalReceipt = await approveTx.wait();
  console.log('[DAO module] token transfer approved:', approvalReceipt);
  yield;
}

/**
 * Submits a proposal to the Optimistic Governor.
 */
export async function* submitProposal(
  web3: any,
  moduleAddress: string,
  explanation: string,
  transactions: OptimisticGovernorTransaction[]
) {
  const explanationBytes = toUtf8Bytes(explanation);
  const tx = await sendTransaction(
    web3,
    moduleAddress,
    OPTIMISTIC_GOVERNOR_ABI as any,
    'proposeTransactions',
    [transactions, explanationBytes]
    // [[["0xB8034521BB1a343D556e5005680B3F17FFc74BeD", 0, "0", "0x"]], '0x']
  );
  yield tx;
  const receipt = await tx.wait();
  console.log('[DAO module] submitted proposal:', receipt);
}

/**
 * Executes a proposal on the Optimistic Governor.
 *
 * This can only be done after the dispute window has ended.
 */
export async function* executeProposal(
  web3: any,
  moduleAddress: string,
  transactions: OptimisticGovernorTransaction[]
) {
  const tx = await sendTransaction(
    web3,
    moduleAddress,
    OPTIMISTIC_GOVERNOR_ABI as any,
    'executeProposal',
    [transactions]
  );
  yield tx;
  const receipt = await tx.wait();
  console.log('[DAO module] executed proposal:', receipt);
}
