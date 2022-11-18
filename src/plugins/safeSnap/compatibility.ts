import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import REALITY_MODULE_ABI from '@/helpers/abi/REALITY_MODULE.json';
import DAO_MODULE_ABI from '@/helpers/abi/DAO_MODULE.json';
import {
  ExecutionData,
  SafeConfig,
  SafeModuleType,
  SafeType
} from '@/helpers/safe';

interface LegacyExecutionData {
  safes: {
    txs:
      | {
          transactions: Record<string, any>[];
        }[]
      | Record<string, any>[][];
    network: string;
    realityAddress: string;
  }[];
}

export function isSafeConfig(safeConfig: unknown): safeConfig is SafeConfig {
  return (
    typeof safeConfig === 'object' &&
    safeConfig !== null &&
    'safe' in safeConfig &&
    'modules' in safeConfig
  );
}

export function isCurrentConfigFormat(
  safeConfigs: any
): safeConfigs is SafeConfig[] {
  return Array.isArray(safeConfigs) && safeConfigs.every(isSafeConfig);
}

export function isCurrentExecutionDataFormat(
  executionData: unknown
): executionData is ExecutionData[] {
  return (
    Array.isArray(executionData) &&
    executionData.every(
      executionSet =>
        executionSet.safe &&
        Array.isArray(executionSet.batches) &&
        executionSet.batches.length > 0
    )
  );
}

export function isLegacyExecutionDataFormat(
  unknownExecutionData: unknown
): unknownExecutionData is LegacyExecutionData {
  return (
    typeof unknownExecutionData === 'object' &&
    unknownExecutionData !== null &&
    'safes' in unknownExecutionData &&
    Array.isArray(unknownExecutionData['safes']) &&
    unknownExecutionData['safes'].every(
      executionSet =>
        executionSet.txs &&
        Array.isArray(executionSet.txs) &&
        executionSet.txs.length > 0
    )
  );
}

export async function mapLegacyExecutionData(legacyExecutionSet, index) {
  const readProvider = getProvider(legacyExecutionSet.network);

  const realityModuleContract = new Contract(
    legacyExecutionSet.realityAddress,
    REALITY_MODULE_ABI,
    readProvider
  );
  const daoModuleContract = new Contract(
    legacyExecutionSet.realityAddress,
    DAO_MODULE_ABI,
    readProvider
  );

  let safeAddress = '';

  try {
    safeAddress = await realityModuleContract.avatar();
  } catch {
    safeAddress = await daoModuleContract.executor();
  }

  const abis = {};
  const mappedExecutionSet: ExecutionData = {
    safe: {
      name: `Safe #${index + 1}`,
      type: SafeType.GNOSIS,
      address: safeAddress,
      network: legacyExecutionSet.network
    },
    module: {
      type: SafeModuleType.REALITY,
      address: legacyExecutionSet.realityAddress
    },
    batches: legacyExecutionSet.txs.map(batch => {
      let legacyTransactions;
      if (Array.isArray(batch)) {
        legacyTransactions = batch;
      } else if (Array.isArray(batch.transactions)) {
        legacyTransactions = batch.transactions;
      }

      if (!legacyTransactions) {
        throw new Error('Invalid legacy execution data');
      }

      return legacyTransactions.map(transaction => {
        if (transaction.abi) {
          abis[transaction.to] = transaction.abi;
        }

        return {
          to: transaction.to,
          data: transaction.data,
          value: BigNumber.from(transaction.value),
          operation: Number(transaction.operation)
        };
      });
    })
  };

  mappedExecutionSet.abis = abis;

  return mappedExecutionSet;
}

export async function handleExecutionDataCompatibility(
  executionData: unknown
): Promise<ExecutionData[]> {
  if (isCurrentExecutionDataFormat(executionData)) {
    return executionData;
  } else if (isLegacyExecutionDataFormat(executionData)) {
    return await Promise.all(executionData.safes.map(mapLegacyExecutionData));
  }

  throw new Error('Unknown execution data format.');
}
