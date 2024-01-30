import {
  OsnapPluginData,
  Transaction as TTransaction,
  GnosisSafe,
  Network
} from '../types';
import {
  validateModuleAddress,
  validateTransaction
} from '../utils/validators';

export const SIMULATION_ENDPOINT =
  'https://ethereum-api-read-prod-77jg7zf4ea-ue.a.run.app/osnap/simulate';

export function validatePayload(data: OsnapPluginData): void | never {
  const { safe } = data;
  if (!safe) {
    throw new Error('No safe data');
  }
  if (!validateModuleAddress(safe.network, safe?.moduleAddress)) {
    throw new Error('Module address is incorrect for this network');
  }
  if (!(safe.transactions.length > 0)) {
    throw new Error('No transactions to simulate');
  }
  safe.transactions.forEach((tx, i) => {
    if (!validateTransaction(tx)) {
      throw new Error(`Transaction ${i + 1} has missing data`);
    }
  });
  return;
}

export function prepareTenderlySimulationPayload(props: {
  transactions: TTransaction[];
  safe: GnosisSafe | null;
  network: Network;
}): OsnapPluginData {
  // this will not happen in this component
  if (!props.safe) {
    throw new Error('No safe selected');
  }

  const { safeAddress, safeName } = props.safe;

  const payload: GnosisSafe = {
    safeAddress,
    safeName,
    network: props.network,
    moduleAddress: props.safe.moduleAddress,
    transactions: props.transactions
  };

  return { safe: payload };
}
