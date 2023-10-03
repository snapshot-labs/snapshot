import { toUtf8Bytes } from "@ethersproject/strings";
import { sendTransaction } from "@snapshot-labs/snapshot.js/src/utils";
import { ERC20_ABI, OPTIMISTIC_GOVERNOR_ABI } from "../constants";
import { OptimisticGovernorTransaction, Network } from "../types";
import { getModuleDetails } from "./getters";

export async function *approveBond(
  network: Network,
  web3: any,
  moduleAddress: string,
  transactions?: OptimisticGovernorTransaction[]
) {
  const moduleDetails = await getModuleDetails(
    network,
    moduleAddress,
    network,
    transactions
  );

  const approveTx = await sendTransaction(
    web3,
    moduleDetails.collateral,
    ERC20_ABI as any,
    'approve',
    [moduleAddress, moduleDetails.minimumBond],
    {} 
  );
  yield approveTx;
  const approvalReceipt = await approveTx.wait();
  console.log('[DAO module] token transfer approved:', approvalReceipt);
  yield;
}

export async function *submitProposal(
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

export async function *executeProposal(
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